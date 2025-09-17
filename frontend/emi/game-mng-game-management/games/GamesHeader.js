import React, { useState, useEffect } from 'react';
import { Paper, Button, Input, Icon, Typography, Hidden, IconButton, Switch } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { FuseAnimate } from '@fuse';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as Actions from '../store/actions';
import { MDText } from 'i18n-react';
import i18n from "../i18n";
import _ from '@lodash';
import { useEventCallback } from 'rxjs-hooks'
import { debounceTime } from "rxjs/operators";  
import GamesStatsModal from './GamesStatsModal';

function GamesHeader(props) {
    const dispatch = useDispatch();
    const { filters, rowsPerPage, page, order, totalDataCount, totalGames, averageMetascore, gamesByGenre } = useSelector(({ GameManagement }) => GameManagement.games);
    const user = useSelector(({ auth }) => auth.user);
    const mainTheme = useSelector(({ fuse }) => fuse.settings.mainTheme);
    const searchTextFilter = useSelector(({ GameManagement }) => GameManagement.games.filters.name);
    const [searchText, setSearchText] = useState(searchTextFilter)
    const [keywordCallBack, keyword] = useEventCallback(
        (event$) => event$.pipe(debounceTime(500))
    )
    const [open, setOpen] = React.useState(false);
    const [highPerformance, setHighPerformance] = useState(false);

    const T = new MDText(i18n.get(user.locale));

    function handleSearchChange(evt) {
        keywordCallBack(evt.target.value);
        setSearchText(evt.target.value);
    }
    useEffect(() => {
        if (keyword !== undefined && keyword !== null)
            dispatch(Actions.setGamesFilterName(keyword))
    }, [keyword, dispatch]);

    function handleRequestImportGames(event, property) {
        dispatch(Actions.importGames({ filters, order, page, rowsPerPage }));
    }

    function handleRequestGameStatistics(event, property) {
        dispatch(Actions.getGameStatistics({ filters }));
    }

    useEffect(() => {
        if (gamesByGenre != null){
            console.log("Games by genre updated:", gamesByGenre);
            setOpen(true);
        }        
    }, [gamesByGenre]);

    const handleHighPerformanceChange = (event) => {
        setHighPerformance(event.target.checked);
        props.onTableTypeChange(event.target.checked ? 'high-performance' : 'normal');
    };

    return (
        <div className="flex flex-1 w-full items-center justify-between">

            <Hidden lgUp>
                <IconButton
                    onClick={(ev) => props.pageLayout.current.toggleLeftSidebar()}
                    aria-label="open left sidebar"
                >
                    <Icon>filter_list</Icon>
                </IconButton>
            </Hidden>

            <div className="flex items-center">
                <FuseAnimate animation="transition.expandIn" delay={300}>
                    <Icon className="text-32 mr-0 sm:mr-12">business</Icon>
                </FuseAnimate>
                <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                    <Typography className="hidden sm:flex" variant="h6">{T.translate("games.games")} </Typography>
                </FuseAnimate>
            </div>

            <div className="flex flex-1 items-center justify-center px-12">

                <ThemeProvider theme={mainTheme}>
                    <FuseAnimate animation="transition.slideDownIn" delay={300}>
                        <Paper className="flex items-center w-full max-w-512 px-8 py-4 rounded-8" elevation={1}>

                            <Icon className="mr-8" color="action">search</Icon>

                            <Input
                                placeholder={T.translate("games.search")}
                                className="flex flex-1"
                                disableUnderline
                                fullWidth
                                value={searchText}
                                inputProps={{
                                    'aria-label': 'Search'
                                }}
                                onChange={handleSearchChange}
                            />
                        </Paper>
                    </FuseAnimate>
                </ThemeProvider>

            </div>
            <div className="flex items-center">
                <Typography className="hidden sm:flex mr-4" variant="h6">{T.translate("games.high_performance")} </Typography>
                <Switch
                    checked={highPerformance}
                    onChange={handleHighPerformanceChange}
                    name="checkedA"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
            </div>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button component={Link} to="/game-mng/games/new" className="whitespace-no-wrap ml-4" variant="contained">
                    <span className="hidden sm:flex">{T.translate("games.add_new_game")}</span>
                    <span className="flex sm:hidden">{T.translate("games.add_new_game_short")}</span>
                </Button>
            </FuseAnimate>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button onClick={handleRequestImportGames} className="whitespace-no-wrap ml-4" variant="contained">
                    <span className="hidden sm:flex">{T.translate("games.import_game")}</span>
                    <span className="flex sm:hidden">{T.translate("games.import_game_short")}</span>
                </Button>
            </FuseAnimate>
            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                <Button onClick={handleRequestGameStatistics} className="whitespace-no-wrap ml-4" variant="contained">
                    <span className="hidden sm:flex">{T.translate("games.game_stats")}</span>
                    <span className="flex sm:hidden">{T.translate("games.game_stats_short")}</span>
                </Button>
            </FuseAnimate>


            <GamesStatsModal open={open} setOpen={setOpen} totalGames={totalGames} averageMetascore={averageMetascore} gamesByGenre={gamesByGenre} />
        </div>
    );
}

export default GamesHeader;
