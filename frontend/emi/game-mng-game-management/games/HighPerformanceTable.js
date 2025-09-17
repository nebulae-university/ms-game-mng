import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
import { Icon, Table, TableCell, TableRow, Checkbox, Typography } from '@material-ui/core';
import { withRouter } from 'react-router-dom';
import GamesTableHead from './GamesTableHead';
import * as Actions from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscription } from "@apollo/react-hooks";
import { MDText } from 'i18n-react';
import i18n from "../i18n";
import { onGameMngGameModified } from "../gql/Game";
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

const ProgressIndicator = memo(({ loaded, total }) => {
    return (
        <Typography className="p-4">{`${loaded} / ${total}`}</Typography>
    );
});

const HighPerformanceTable = (props) => {
    const dispatch = useDispatch();
    const { filters, order, totalDataCount } = useSelector(({ GameManagement }) => GameManagement.games);
    const user = useSelector(({ auth }) => auth.user);
    const [selected, setSelected] = useState([]);
    const allGamesRef = useRef([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const T = new MDText(i18n.get(user.locale));
    const timeoutRef = useRef();
    const wsMessagesRef = useRef([]);

    const onGameMngGameModifiedData = useSubscription(...onGameMngGameModified({ id: "ANY" }));

    const setAllGames = useCallback((games) => {
        allGamesRef.current = games;
        forceUpdate();
    }, []);

    const forceUpdate = React.useReducer(() => ({}))[1];

    useEffect(() => {
        if (onGameMngGameModifiedData.data) {
            wsMessagesRef.current.push(onGameMngGameModifiedData.data.GameMngGameModified);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                const newGames = [...allGamesRef.current];
                wsMessagesRef.current.forEach(game => {
                    const gameIndex = newGames.findIndex(g => g.id === game.id);
                    if (gameIndex > -1) {
                        newGames[gameIndex] = game;
                    } else {
                        newGames.push(game);
                    }
                });
                setAllGames(newGames);
                setLoadedCount(newGames.length);
                wsMessagesRef.current = [];
            }, 500);
        }
    }, [onGameMngGameModifiedData.data, setAllGames]);

    useEffect(() => {
        dispatch(Actions.setGamesFilterOrganizationId(user.selectedOrganization.id));
    }, [user.selectedOrganization, dispatch]);

    useEffect(() => {
        if (filters.organizationId) {
            const fetchAllGames = async () => {
                let allGames = [];
                let page = 0;
                let hasMore = true;
                while(hasMore){
                    const result = await dispatch(Actions.getGames({ filters, order, page, rowsPerPage: 500 }));
                    if(result && result.payload && result.payload.listing){
                        allGames = allGames.concat(result.payload.listing);
                        setAllGames(allGames);
                        setLoadedCount(allGames.length);
                        page++;
                        hasMore = result.payload.listing.length === 500;
                    } else {
                        hasMore = false;
                    }
                }
            }
            fetchAllGames();
        }
    }, [dispatch, filters, order, setAllGames]);


    const handleRequestSort = useCallback((event, property) => {
        const id = property;
        let direction = 'desc';

        if (order.id === property && order.direction === 'desc') {
            direction = 'asc';
        }

        dispatch(Actions.setGamesOrder({ direction, id }));
    }, [dispatch, order]);


    const handleRequestRemove = useCallback(() => {
        dispatch(Actions.removeGames(selected, { filters, order, page: 0, rowsPerPage: totalDataCount }));
    }, [dispatch, selected, filters, order, totalDataCount]);

    const handleSelectAllClick = useCallback((event) => {
        if (event.target.checked) {
            setSelected(allGamesRef.current.map(n => n.id));
            return;
        }
        setSelected([]);
    }, []);

    const handleClick = useCallback((item) => {
        props.history.push('/game-mng/games/' + item.id + '/' + item.name.replace(/[\s_·!@#$%^&*(),.?":{}|<>]+/g, '-').toLowerCase());
    }, [props.history]);

    const handleCheck = useCallback((event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        }
        else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        }
        else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        }
        else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    }, [selected]);

    const Cell = memo(({ columnIndex, rowIndex, style }) => {
        const game = allGamesRef.current[rowIndex];
        const isSelected = selected.indexOf(game.id) !== -1;

        return (
            <div style={style}>
                <TableRow
                    className="h-64 cursor-pointer"
                    hover
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={-1}
                    key={game.id}
                    selected={isSelected}
                    onClick={() => handleClick(game)}
                >
                    <TableCell className="w-48 px-4 sm:px-12" padding="checkbox">
                        <Checkbox
                            checked={isSelected}
                            onClick={event => event.stopPropagation()}
                            onChange={event => handleCheck(event, game.id)}
                        />
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {game.active ?
                            (
                                <Icon className="text-green text-20">check_circle</Icon>
                            ) :
                            (
                                <Icon className="text-red text-20">remove_circle</Icon>
                            )
                        }
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {game.name}
                    </TableCell>
                </TableRow>
            </div>
        );
    });

    return (
        <div className="w-full flex flex-col h-full">
            <div className="flex flex-row justify-end">
                <ProgressIndicator loaded={loadedCount} total={totalDataCount} />
            </div>
            <Table className="min-w-xs" aria-labelledby="tableTitle">
                <GamesTableHead
                    numSelected={selected.length}
                    order={order}
                    onSelectAllClick={handleSelectAllClick}
                    onRequestSort={handleRequestSort}
                    onRequestRemove={handleRequestRemove}
                    rowCount={allGamesRef.current.length}
                />
            </Table>
            <div style={{ flex: '1 1 auto' }}>
                <AutoSizer>
                    {({ height, width }) => (
                        <Grid
                            className="grid"
                            columnCount={1}
                            columnWidth={width}
                            height={height}
                            rowCount={allGamesRef.current.length}
                            rowHeight={64}
                            width={width}
                        >
                            {Cell}
                        </Grid>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
}

export default withRouter(HighPerformanceTable);
