import React, { useEffect, useState, memo } from 'react';
import { Icon, Table, TableBody, TableCell, TableRow, Checkbox } from '@material-ui/core';
import { FuseScrollbars } from '@fuse';
import { withRouter } from 'react-router-dom';
import GamesTableHead from './GamesTableHead';
import * as Actions from '../store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { useSubscription } from "@apollo/react-hooks";
import { MDText } from 'i18n-react';
import i18n from "../i18n";
import { onGameMngGameModified } from "../gql/Game";
import { FixedSizeGrid as Grid } from 'react-window';

const HighPerformanceTable = (props) => {
    const dispatch = useDispatch();
    const games = useSelector(({ GameManagement }) => GameManagement.games.data);
    const { filters, order, totalDataCount } = useSelector(({ GameManagement }) => GameManagement.games);
    const user = useSelector(({ auth }) => auth.user);
    const [selected, setSelected] = useState([]);
    const T = new MDText(i18n.get(user.locale));

    const onGameMngGameModifiedData = useSubscription(...onGameMngGameModified({ id: "ANY" }));

    useEffect(() => {
        dispatch(Actions.setGamesFilterOrganizationId(user.selectedOrganization.id));
    }, [user.selectedOrganization, dispatch]);

    useEffect(() => {
        if (filters.organizationId) {
            // Fetch all data, not just a single page
            dispatch(Actions.getGames({ filters, order, page: 0, rowsPerPage: totalDataCount }));
        }
    }, [dispatch, filters, order, totalDataCount, onGameMngGameModifiedData.data]);


    function handleRequestSort(event, property) {
        const id = property;
        let direction = 'desc';

        if (order.id === property && order.direction === 'desc') {
            direction = 'asc';
        }

        dispatch(Actions.setGamesOrder({ direction, id }));
    }


    function handleRequestRemove(event, property) {
        dispatch(Actions.removeGames(selected, { filters, order, page: 0, rowsPerPage: totalDataCount }));
    }

    function handleSelectAllClick(event) {
        if (event.target.checked) {
            setSelected(games.map(n => n.id));
            return;
        }
        setSelected([]);
    }

    function handleClick(item) {
        props.history.push('/game-mng/games/' + item.id + '/' + item.name.replace(/[\s_·!@#$%^&*(),.?":{}|<>]+/g, '-').toLowerCase());
    }

    function handleCheck(event, id) {
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
    }

    const Cell = memo(({ columnIndex, rowIndex, style }) => {
        const game = games[rowIndex];
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
                    onClick={event => handleClick(game)}
                >
                    <TableCell className="w-48 px-4 sm:px-12" padding="checkbox">
                        <Checkbox
                            checked={isSelected}
                            onClick={event => event.stopPropagation()}
                            onChange={event => handleCheck(event, game.id)}
                        />
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {game.name}
                    </TableCell>
                    <TableCell component="th" scope="row" align="right">
                        {game.active ?
                            (
                                <Icon className="text-green text-20">check_circle</Icon>
                            ) :
                            (
                                <Icon className="text-red text-20">remove_circle</Icon>
                            )
                        }
                    </TableCell>
                </TableRow>
            </div>
        );
    });

    return (
        <div className="w-full flex flex-col">

            <FuseScrollbars className="flex-grow overflow-x-auto">

                <Table className="min-w-xs" aria-labelledby="tableTitle">

                    <GamesTableHead
                        numSelected={selected.length}
                        order={order}
                        onSelectAllClick={handleSelectAllClick}
                        onRequestSort={handleRequestSort}
                        onRequestRemove={handleRequestRemove}
                        rowCount={games.length}
                    />
                </Table>
                <Grid
                    className="grid"
                    columnCount={1}
                    columnWidth={window.innerWidth - 280}
                    height={400}
                    rowCount={games.length}
                    rowHeight={64}
                    width={window.innerWidth - 280}
                >
                    {Cell}
                </Grid>
            </FuseScrollbars>
        </div>
    );
}

export default withRouter(HighPerformanceTable);