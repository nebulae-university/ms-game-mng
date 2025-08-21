'use strict'

const { iif } = require("rxjs");
const { tap } = require('rxjs/operators');
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;

const GameDA = require("./data-access/GameDA");
/**
 * Singleton instance
 * @type { GameES }
 */
let instance;

class GameES {

    constructor() {
    }

    /**     
     * Generates and returns an object that defines the Event-Sourcing events handlers.
     * 
     * The map is a relationship of: AGGREGATE_TYPE VS { EVENT_TYPE VS  { fn: rxjsFunction, instance: invoker_instance } }
     * 
     * ## Example
     *  { "User" : { "UserAdded" : {fn: handleUserAdded$, instance: classInstance } } }
     */
    generateEventProcessorMap() {
        return {
            'Game': {
                "GameModified": { fn: instance.handleGameModified$, instance, processOnlyOnSync: true },
            }
        }
    };

    /**
     * Using the GameModified events restores the MaterializedView
     * This is just a recovery strategy
     * @param {*} GameModifiedEvent Game Modified Event
     */
    handleGameModified$({ etv, aid, av, data, user, timestamp }) {
        const aggregateDataMapper = [
            /*etv=0 mapper*/ () => { throw new Error('etv 0 is not an option') },
            /*etv=1 mapper*/ (eventData) => { return { ...eventData, modType: undefined }; }
        ];
        delete aggregateDataMapper.modType;
        const aggregateData = aggregateDataMapper[etv](data);
        return iif(
            () => (data.modType === 'DELETE'),
            GameDA.deleteGame$(aid),
            GameDA.updateGameFromRecovery$(aid, aggregateData, av)
        ).pipe(
            tap(() => ConsoleLogger.i(`GameES.handleGameModified: ${data.modType}: aid=${aid}, timestamp=${timestamp}`))
        )
    }
}


/**
 * @returns {GameES}
 */
module.exports = () => {
    if (!instance) {
        instance = new GameES();
        ConsoleLogger.i(`${instance.constructor.name} Singleton created`);
    }
    return instance;
};