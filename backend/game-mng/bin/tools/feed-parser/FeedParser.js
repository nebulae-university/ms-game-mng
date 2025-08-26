'use strict';

const { from } = require("rxjs");
const { mergeMap } = require('rxjs/operators');
const fetch = require('node-fetch');

class FeedParserClass {
    static getGames$(feed) {
        return from(fetch(feed)).pipe(
            mergeMap(res => res.json()),
            mergeMap(games => from(games))
        );
    }

    static getGameDetailById$(id) {
        const url = `https://www.freetogame.com/api/game?id=${id}`;
        return fetch(url).then(res => res.json());
    }

    static parseFeed$(feed) {
        // This function is no longer needed, but we will keep it for compatibility
        // and delegate to the new getGames$ function.
        return this.getGames$(feed);
    }
}

/**
 * @returns {FeedParserClass}
 */
module.exports = FeedParserClass;