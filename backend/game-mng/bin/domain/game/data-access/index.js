"use strict";

const Rx = require('rxjs');

const GameDA = require("./GameDA");

module.exports = {
  /**
   * Data-Access start workflow
   */
  start$: Rx.concat(GameDA.start$()),
  /**
   * @returns {GameDA}
   */
  GameDA: GameDA,
};
