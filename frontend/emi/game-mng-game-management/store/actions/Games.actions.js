import { defer } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import graphqlService from '../../../../services/graphqlService';
import { GameMngGameListing, GameMngDeleteGame } from '../../gql/Game';

export const SET_GAMES = '[GAME_MNG] SET GAMES';
export const SET_GAMES_PAGE = '[GAME_MNG] SET GAMES PAGE';
export const SET_GAMES_ROWS_PER_PAGE = '[GAME_MNG] SET GAMES ROWS PER PAGE';
export const SET_GAMES_ORDER = '[GAME_MNG] SET GAMES ORDER';
export const SET_GAMES_FILTERS_ORGANIZATION_ID = '[GAME_MNG] SET GAMES FILTERS ORGANIZATION_ID';
export const SET_GAMES_FILTERS_NAME = '[GAME_MNG] SET GAMES FILTERS NAME';
export const SET_GAMES_FILTERS_ACTIVE = '[GAME_MNG] SET GAMES FILTERS ACTIVE';

/**
 * Common function to generate the arguments for the GameMngGameListing query based on the user input
 * @param {Object} queryParams 
 */
function getListingQueryArguments({ filters: { name, organizationId, active }, order, page, rowsPerPage }) {
    const args = {
        "filterInput": { organizationId },
        "paginationInput": { "page": page, "count": rowsPerPage, "queryTotalResultCount": (page === 0) },
        "sortInput": order.id ? { "field": order.id, "asc": order.direction === "asc" } : undefined
    };
    if (name.trim().length > 0) {
        args.filterInput.name = name;
    }
    if (active !== null) {
        args.filterInput.active = active;
    }
    return args;
}

/**
 * Queries the Game Listing based on selected filters, page and order
 * @param {{ filters, order, page, rowsPerPage }} queryParams
 */
export function getGames({ filters, order, page, rowsPerPage }) {
    const args = getListingQueryArguments({ filters, order, page, rowsPerPage });    
    return (dispatch) => graphqlService.client.query(GameMngGameListing(args)).then(result => {
        return dispatch({
            type: SET_GAMES,
            payload: result.data.GameMngGameListing
        });
    })
}

/**
 * Executes the mutation to remove the selected rows
 * @param {*} selectedForRemovalIds 
 * @param {*} param1 
 */
export function removeGames(selectedForRemovalIds, { filters, order, page, rowsPerPage }) {
    const deleteArgs = { ids: selectedForRemovalIds };
    const listingArgs = getListingQueryArguments({ filters, order, page, rowsPerPage });
    return (dispatch) => defer(() => graphqlService.client.mutate(GameMngDeleteGame(deleteArgs))).pipe(
        mergeMap(() => defer(() => graphqlService.client.query(GameMngGameListing(listingArgs)))),
        map((result) =>
            dispatch({
                type: SET_GAMES,
                payload: result.data.GameMngGameListing
            })
        )
    ).toPromise();
}

/**
 * Set the listing page
 * @param {int} page 
 */
export function setGamesPage(page) {
    return {
        type: SET_GAMES_PAGE,
        page
    }
}

/**
 * Set the number of rows to see per page
 * @param {*} rowsPerPage 
 */
export function setGamesRowsPerPage(rowsPerPage) {
    return {
        type: SET_GAMES_ROWS_PER_PAGE,
        rowsPerPage
    }
}

/**
 * Set the table-column order
 * @param {*} order 
 */
export function setGamesOrder(order) {
    return {
        type: SET_GAMES_ORDER,
        order
    }
}

/**
 * Set the name filter
 * @param {string} name 
 */
export function setGamesFilterName(name) {    
    return {
        type: SET_GAMES_FILTERS_NAME,
        name
    }
}

/**
 * Set the filter active flag on/off/both
 * @param {boolean} active 
 */
export function setGamesFilterActive(active) {
    return {
        type: SET_GAMES_FILTERS_ACTIVE,
        active
    }
}

/**
 * set the organizationId filter
 * @param {string} organizationId 
 */
export function setGamesFilterOrganizationId(organizationId) {    
    return {
        type: SET_GAMES_FILTERS_ORGANIZATION_ID,
        organizationId
    }
}



