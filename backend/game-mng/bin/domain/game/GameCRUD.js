"use strict";

const uuidv4 = require("uuid/v4");
const { of, forkJoin, from, iif, throwError } = require("rxjs");
const { mergeMap, catchError, map, toArray, pluck, tap, last } = require('rxjs/operators');

const Event = require("@nebulae/event-store").Event;
const { CqrsResponseHelper } = require('@nebulae/backend-node-tools').cqrs;;
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;
const { CustomError, INTERNAL_SERVER_ERROR_CODE, PERMISSION_DENIED } = require("@nebulae/backend-node-tools").error;
const { brokerFactory } = require("@nebulae/backend-node-tools").broker;

const broker = brokerFactory();
const eventSourcing = require("../../tools/event-sourcing").eventSourcing;
const FeedParser = require("../../tools/feed-parser").FeedParser;
const GameDA = require("./data-access/GameDA");

const READ_ROLES = ["GAME_READ"];
const WRITE_ROLES = ["GAME_WRITE"];
const REQUIRED_ATTRIBUTES = [];
const MATERIALIZED_VIEW_TOPIC = "emi-gateway-materialized-view-updates";

const GAME_FEED_URL = process.env.GAME_FEED_URL || 'https://www.freetogame.com/api/games';

/**
 * Singleton instance
 * @type { GameCRUD }
 */
let instance;

class GameCRUD {
  constructor() {
  }

  /**     
   * Generates and returns an object that defines the CQRS request handlers.
   * 
   * The map is a relationship of: AGGREGATE_TYPE VS { MESSAGE_TYPE VS  { fn: rxjsFunction, instance: invoker_instance } }
   * 
   * ## Example
   *  { "CreateUser" : { "somegateway.someprotocol.mutation.CreateUser" : {fn: createUser$, instance: classInstance } } }
   */
  generateRequestProcessorMap() {
    return {
      'Game': {
        "emigateway.graphql.query.GameMngGameListing": { fn: instance.getGameMngGameListing$, instance, jwtValidation: { roles: READ_ROLES, attributes: REQUIRED_ATTRIBUTES } },
        "emigateway.graphql.query.GameMngGame": { fn: instance.getGame$, instance, jwtValidation: { roles: READ_ROLES, attributes: REQUIRED_ATTRIBUTES } },
        "emigateway.graphql.query.GameMngGameDetails": { fn: instance.getGameDetails$, instance, jwtValidation: { roles: READ_ROLES, attributes: REQUIRED_ATTRIBUTES } },
        "emigateway.graphql.mutation.GameMngCreateGame": { fn: instance.createGame$, instance, jwtValidation: { roles: WRITE_ROLES, attributes: REQUIRED_ATTRIBUTES } },
        "emigateway.graphql.mutation.GameMngImportGames": { fn: instance.importGames$, instance, jwtValidation: { roles: WRITE_ROLES, attributes: REQUIRED_ATTRIBUTES } },
        "emigateway.graphql.mutation.GameMngUpdateGame": { fn: instance.updateGame$, jwtValidation: { roles: WRITE_ROLES, attributes: REQUIRED_ATTRIBUTES } },
        "emigateway.graphql.mutation.GameMngDeleteGames": { fn: instance.deleteGames$, jwtValidation: { roles: WRITE_ROLES, attributes: REQUIRED_ATTRIBUTES } },
      }
    }
  };


  /**  
   * Gets the Game list
   *
   * @param {*} args args
   */
  getGameMngGameListing$({ args }, authToken) {
    const { filterInput, paginationInput, sortInput } = args;
    const { queryTotalResultCount = false } = paginationInput || {};

    return forkJoin(
      GameDA.getGameList$(filterInput, paginationInput, sortInput).pipe(toArray()),
      queryTotalResultCount ? GameDA.getGameSize$(filterInput) : of(undefined),
    ).pipe(
      map(([listing, queryTotalResultCount]) => ({ listing, queryTotalResultCount })),
      mergeMap(rawResponse => CqrsResponseHelper.buildSuccessResponse$(rawResponse)),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    );
  }

  /**  
   * Gets the get Game by id
   *
   * @param {*} args args
   */
  getGame$({ args }, authToken) {
    const { id, organizationId } = args;
    return GameDA.getGame$(id, organizationId).pipe(
      mergeMap(rawResponse => CqrsResponseHelper.buildSuccessResponse$(rawResponse)),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    );

  }

  getGameDetails$({ args }, authToken) {
    const { id, organizationId } = args;
    return from(FeedParser.getGameDetailById$(id)).pipe(
      mergeMap(rawResponse => CqrsResponseHelper.buildSuccessResponse$(rawResponse)),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    );
  }

  /**
  * Create a Game
  */
  createGame$({ root, args, jwt }, authToken) {
    const aggregateId = uuidv4();
    const input = {
      active: false,
      ...args.input,
    };

    return GameDA.createGame$(aggregateId, input, authToken.preferred_username).pipe(
      mergeMap(aggregate => forkJoin(
        CqrsResponseHelper.buildSuccessResponse$(aggregate),
        eventSourcing.emitEvent$(instance.buildAggregateMofifiedEvent('CREATE', 'Game', aggregateId, authToken, aggregate), { autoAcknowledgeKey: process.env.MICROBACKEND_KEY }),
        broker.send$(MATERIALIZED_VIEW_TOPIC, `GameMngGameModified`, aggregate)
      )),
      map(([sucessResponse]) => sucessResponse),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    )
  }


  /**
  * imports multiple games
  */
  importGames$({ root, args, jwt }, authToken) {


    ConsoleLogger.i(`Importing games with args: ${JSON.stringify(args)}`);

    return FeedParser.parseFeed$(GAME_FEED_URL).pipe(

      //tap(game => ConsoleLogger.i(`Parsed item: ${JSON.stringify(game,null,1)}`)),

      map(({id, title: name,short_description: description }) => ({ id: String(id), name, description, active: true, organizationId: authToken.organizationId })),
      mergeMap(game => GameDA.createGame$(game.id, game, authToken.preferred_username)),
      mergeMap(game => eventSourcing.emitEvent$(instance.buildAggregateMofifiedEvent('CREATE', 'Game', game.id, authToken, game), { autoAcknowledgeKey: process.env.MICROBACKEND_KEY })),
      toArray(),
      map((array)=> ({code: array.length, message:'ok'})),
      mergeMap(aggregate => forkJoin(
        CqrsResponseHelper.buildSuccessResponse$(aggregate),
      )),
      map(([sucessResponse]) => sucessResponse),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    );


  }

  /**
   * updates an Game 
   */
  updateGame$({ root, args, jwt }, authToken) {
    const { id, input, merge } = args;

    return (merge ? GameDA.updateGame$ : GameDA.replaceGame$)(id, input, authToken.preferred_username).pipe(
      mergeMap(aggregate => forkJoin(
        CqrsResponseHelper.buildSuccessResponse$(aggregate),
        eventSourcing.emitEvent$(instance.buildAggregateMofifiedEvent(merge ? 'UPDATE_MERGE' : 'UPDATE_REPLACE', 'Game', id, authToken, aggregate), { autoAcknowledgeKey: process.env.MICROBACKEND_KEY }),
        broker.send$(MATERIALIZED_VIEW_TOPIC, `GameMngGameModified`, aggregate)
      )),
      map(([sucessResponse]) => sucessResponse),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    )
  }


  /**
   * deletes an Game
   */
  deleteGames$({ root, args, jwt }, authToken) {
    const { ids } = args;
    return forkJoin(
      GameDA.deleteGames$(ids),
      from(ids).pipe(
        mergeMap(id => eventSourcing.emitEvent$(instance.buildAggregateMofifiedEvent('DELETE', 'Game', id, authToken, {}), { autoAcknowledgeKey: process.env.MICROBACKEND_KEY })),
        toArray()
      )
    ).pipe(
      map(([ok, esResps]) => ({ code: ok ? 200 : 400, message: `Game with id:s ${JSON.stringify(ids)} ${ok ? "has been deleted" : "not found for deletion"}` })),
      mergeMap((r) => forkJoin(
        CqrsResponseHelper.buildSuccessResponse$(r),
        broker.send$(MATERIALIZED_VIEW_TOPIC, `GameMngGameModified`, { id: 'deleted', name: '', active: false, description: '' })
      )),
      map(([cqrsResponse, brokerRes]) => cqrsResponse),
      catchError(err => iif(() => err.name === 'MongoTimeoutError', throwError(err), CqrsResponseHelper.handleError$(err)))
    );
  }


  /**
   * Generate an Modified event 
   * @param {string} modType 'CREATE' | 'UPDATE' | 'DELETE'
   * @param {*} aggregateType 
   * @param {*} aggregateId 
   * @param {*} authToken 
   * @param {*} data 
   * @returns {Event}
   */
  buildAggregateMofifiedEvent(modType, aggregateType, aggregateId, authToken, data) {
    return new Event({
      eventType: `${aggregateType}Modified`,
      eventTypeVersion: 1,
      aggregateType: aggregateType,
      aggregateId,
      data: {
        modType,
        ...data
      },
      user: authToken.preferred_username
    })
  }
}

/**
 * @returns {GameCRUD}
 */
module.exports = () => {
  if (!instance) {
    instance = new GameCRUD();
    ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
  }
  return instance;
};
