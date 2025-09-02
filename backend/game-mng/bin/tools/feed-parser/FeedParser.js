'use strict';

const { from, range, forkJoin, timer, race, of } = require("rxjs");
const { mergeMap, filter, tap, takeUntil, bufferCount, concatMap, catchError, retry } = require('rxjs/operators');
const { ConsoleLogger } = require('@nebulae/backend-node-tools').log;
const { CustomError } = require("@nebulae/backend-node-tools").error;
const fetch = require('node-fetch');


class FeedParserClass {

    static getGames$(feed) {
        return range(0, 1000).pipe(
            bufferCount(100),
            tap(ids => {
                console.log(`Fetching games for IDs: ${ids.join(", ")}`);
            }),
            concatMap(ids =>
                forkJoin(
                    ids.map(id => FeedParserClass.fetchGameDetailById$(feed, id))
                ).pipe(
                    tap(games => {
                        console.log(`Fetched games: ${games.length}`);
                    }),
                    mergeMap(responses => from(responses)),
                    filter(game => game?.id !== undefined)
                )
            ),

        );
    }


    static getGames$_old(feed) {
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


    static fetchGameDetailById$(feed, id) {
        const timeout$ = timer(500).pipe(
            tap(() => {
                throw new CustomError(
                    'GameFetchingTimeout',
                    'FeedParserClass.fetchGameDetailById$',
                    1,
                    `Game fetching timed out after 200ms`
                )
            })
        );
        const fetching$ = fetch(`${feed}?id=${id}`).then(res => res.json());
        return race(timeout$, fetching$).pipe(
            retry(3),

            
            catchError(err => {
                console.error(`Error fetching game details for ID ${id}: ${err.message}`);
                return of(null);
            })
        );
    }
}

/**
 * @returns {FeedParserClass}
 */
module.exports = FeedParserClass;