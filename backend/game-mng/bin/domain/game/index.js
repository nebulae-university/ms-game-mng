"use strict";

const { empty, Observable } = require("rxjs");

const GameCRUD = require("./GameCRUD")();
const GameES = require("./GameES")();
const DataAcess = require("./data-access/");

module.exports = {
  /**
   * domain start workflow
   */
  start$: DataAcess.start$,
  /**
   * start for syncing workflow
   * @returns {Observable}
   */
  startForSyncing$: DataAcess.start$,
  /**
   * start for getting ready workflow
   * @returns {Observable}
   */
  startForGettingReady$: empty(),
  /**
   * Stop workflow
   * @returns {Observable}
   */
  stop$: DataAcess.stop$,
  /**
   * @returns {GameCRUD}
   */
  GameCRUD: GameCRUD,
  /**
   * CRUD request processors Map
   */
  cqrsRequestProcessorMap: GameCRUD.generateRequestProcessorMap(),
  /**
   * @returns {GameES}
   */
  GameES,
  /**
   * EventSoircing event processors Map
   */
  eventSourcingProcessorMap: GameES.generateEventProcessorMap(),
};
