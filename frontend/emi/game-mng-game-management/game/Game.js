/* React core */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
/* UI core */
import { Button, Tab, Tabs, TextField, Icon, Typography, Switch, FormControlLabel } from '@material-ui/core';
import { FuseAnimate, FusePageCarded, FuseLoading } from '@fuse';
import { useForm } from '@fuse/hooks';
/* GraphQL Client hooks */
import { useSubscription, useLazyQuery, useMutation } from "@apollo/react-hooks";
/* Redux */
import { useDispatch, useSelector } from 'react-redux';
import withReducer from 'app/store/withReducer';
import * as AppActions from 'app/store/actions';
import * as Actions from '../store/actions';
import reducer from '../store/reducers';
/* Tools */
import _ from '@lodash';
import { Formik } from 'formik';
import * as Yup from "yup";
import { MDText } from 'i18n-react';
import i18n from "../i18n";
/* Support pages */
import Error404Page from 'app/main/pages/Error404Page';
import Error500Page from 'app/main/pages/Error500Page';
/* GQL queries/mutation to use */
import {
    onGameMngGameModified,
    GameMngGame,
    GameMngCreateGame,
    GameMngUpdateGame,
    GameMngGameDetails
} from "../gql/Game";
import Metadata from './tabs/Metadata';
import { BasicInfo, basicInfoFormValidationsGenerator } from './tabs/BasicInfo';


/**
 * Default Aggregate data when creating 
 */
const defaultData = {
    name: '',
    description: '',
    active: true,
};

function Game(props) {
    //Redux dispatcher
    const dispatch = useDispatch();

    // current logged user
    const loggedUser = useSelector(({ auth }) => auth.user);

    // Game STATE and CRUD ops
    const [game, setGame] = useState();
    const gqlGame = GameMngGame({ id: props.match.params.gameId });
    const gqlGameDetails = GameMngGameDetails({ id: props.match.params.gameId });
    const [readGame, readGameResult] = useLazyQuery(gqlGame.query, { fetchPolicy: gqlGame.fetchPolicy })
    const [readGameDetails, readGameDetailsResult] = useLazyQuery(gqlGameDetails.query, { fetchPolicy: gqlGameDetails.fetchPolicy })
    const [createGame, createGameResult] = useMutation(GameMngCreateGame({}).mutation);
    const [updateGame, updateGameResult] = useMutation(GameMngUpdateGame({}).mutation);
    const onGameModifiedResult = useSubscription(...onGameMngGameModified({ id: props.match.params.gameId }));

    //UI controls states
    const [tabValue, setTabValue] = useState(0);
    const { form, handleChange: formHandleChange, setForm } = useForm(null);
    const [errors, setErrors] = useState([]);

    //Translation services
    let T = new MDText(i18n.get(loggedUser.locale));

    /*
    *  ====== USE_EFFECT SECTION ========
    */

    /*
        Prepares the FORM:
            - if is NEW then use default data
            - if is old Game then loads the data
        Reads (from the server) a Game when:
            - having a valid props.match.params (aka ID)
            - having or changing the selected Organization ID
    */
    useEffect(() => {
        function updateGameState() {
            const params = props.match.params;
            const { gameId } = params;
            if (gameId !== 'new') {
                if (loggedUser.selectedOrganization && loggedUser.selectedOrganization.id !== "") {
                    readGame({ variables: { organizationId: loggedUser.selectedOrganization.id, id: gameId } });
                }
            } else if (loggedUser.selectedOrganization && loggedUser.selectedOrganization.id) {
                setGame({ ...defaultData, organizationId: loggedUser.selectedOrganization.id })
                dispatch(Actions.setGamesPage(0));
            }
        }
        updateGameState();
    }, [dispatch, props.match.params, loggedUser.selectedOrganization]);


    //Refresh Game state when the lazy query (READ) resolves
    useEffect(() => {
        if (readGameResult.data)
            setGame(readGameResult.data.GameMngGame)
    }, [readGameResult])
    //Refresh Game state when the CREATE mutation resolves
    useEffect(() => {
        if (createGameResult.data && createGameResult.data.GameMngCreateGame) {
            setGame(createGameResult.data.GameMngCreateGame)
            props.history.push('/game-mng/games/' + createGameResult.data.GameMngCreateGame.id + '/');
            dispatch(AppActions.showMessage({ message: T.translate("game.create_success"), variant: 'success' }));
        }

    }, [createGameResult])
    //Refresh Game state when the UPDATE mutation resolves
    useEffect(() => {
        if (updateGameResult.data) {
            setGame(updateGameResult.data.GameMngUpdateGame);
        }
    }, [updateGameResult])
    //Refresh Game state when GQL subscription notifies a change
    useEffect(() => {
        if (onGameModifiedResult.data) {
            setForm(onGameModifiedResult.data.GameMngGameModified);
            dispatch(AppActions.showMessage({ message: T.translate("game.update_success"), variant: 'success' }));
        }
    }, [onGameModifiedResult.data]);


    // Keep the sync between the Game state and the form state
    useEffect(() => {
        if ((game && !form) || (game && form && game.id !== form.id)) {
            setForm(game);
        }
    }, [form, game, setForm]);

    // DISPLAYS floating message for CRUD errors
    useEffect(() => {
        const error = createGameResult.error || updateGameResult.error;
        if (error) {
            const { graphQLErrors, networkError, message } = error;
            const errMessage = networkError
                ? JSON.stringify(networkError)
                : graphQLErrors.length === 0
                    ? message
                    : graphQLErrors[0].message.name
            dispatch(AppActions.showMessage({
                message: errMessage,
                variant: 'error'
            }));
        }
    }, [createGameResult.error, updateGameResult.error])

    /*
    *  ====== FORM HANDLERS, VALIDATORS AND LOGIC ========
    */

    /**
     * Handles Tab changes
     * @param {*} event 
     * @param {*} tabValue 
     */
    function handleChangeTab(event, tabValue) {
        setTabValue(tabValue);
    }

    /**
     * Evaluates if the logged user has enought permissions to WRITE (Create/Update/Delete) data
     */
    function canWrite() {
        return loggedUser.role.includes('GAME_WRITE');
    }

    /**
     * Evals if the Save button can be submitted
     */
    function canBeSubmitted() {
        return (
            canWrite()
            && !updateGameResult.loading
            && !createGameResult.loading
            && _.isEmpty(errors)
            && !_.isEqual({ ...game, metadata: undefined }, { ...form, metadata: undefined })
        );
    }

    /**
     * Handle the Save button action
     */
    function handleSave() {
        const { id } = form;
        if (id === undefined) {
            createGame({ variables: { input: { ...form, organizationId: loggedUser.selectedOrganization.id } } });
        } else {
            updateGame({ variables: { id, input: { ...form, id: undefined, __typename: undefined, metadata: undefined }, merge: true } });
        }
    }

    function queryGameMngGameDetails() {
        readGameDetails({ variables: { organizationId: loggedUser.selectedOrganization.id, id: form.id } });
    }

    /*
    *  ====== ALTERNATIVE PAGES TO RENDER ========
    */

    // Shows an ERROR page when a really important server response fails
    const gqlError = readGameResult.error;
    if (gqlError) {
        const firstErrorMessage = gqlError.graphQLErrors[0].message;
        if (!firstErrorMessage.includes || !firstErrorMessage.includes("Cannot return null")) {
            return (<Error500Page message={T.translate("game.internal_server_error")}
                description={gqlError.graphQLErrors.map(e => `@${e.path[0]} => code ${e.message.code}: ${e.message.name}`)} />);
        }
    }

    // Shows the Loading bar if we are waiting for something mandatory
    if (!loggedUser.selectedOrganization || readGameResult.loading)  {
        return (<FuseLoading />);
    }

    // Shows a NotFound page if the Game has not been found. (maybe because it belongs to other organization or the id does not exists)
    if (props.match.params.gameId !== "new" && !readGameResult.data) {
        return (<Error404Page message={T.translate("game.not_found")} />);
    }


    /*
    *  ====== FINAL PAGE TO RENDER ========
    */

    return (
        <FusePageCarded
            classes={{
                toolbar: "p-0",
                header: "min-h-72 h-72 sm:h-136 sm:min-h-136"
            }}
            header={
                form && (
                    <div className="flex flex-1 w-full items-center justify-between">

                        <div className="flex flex-col items-start max-w-full">

                            <FuseAnimate animation="transition.slideRightIn" delay={300}>
                                <Typography className="normal-case flex items-center sm:mb-12" component={Link} role="button" to="/game-mng/games" color="inherit">
                                    <Icon className="mr-4 text-20">arrow_back</Icon>
                                    {T.translate("game.games")}
                                </Typography>
                            </FuseAnimate>

                            <div className="flex items-center max-w-full">
                                <FuseAnimate animation="transition.expandIn" delay={300}>
                                    <Icon className="text-32 mr-0 sm:text-48 mr-12">business</Icon>
                                </FuseAnimate>

                                <div className="flex flex-col min-w-0">
                                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                        <Typography className="text-16 sm:text-20 truncate">
                                            {form.name ? form.name : 'New Game'}
                                        </Typography>
                                    </FuseAnimate>
                                    <FuseAnimate animation="transition.slideLeftIn" delay={300}>
                                        <Typography variant="caption">{T.translate("game.game_detail")}</Typography>
                                    </FuseAnimate>
                                </div>
                            </div>
                        </div>
                        <FuseAnimate animation="transition.slideRightIn" delay={300}>
                            <Button
                                className="whitespace-no-wrap"
                                variant="contained"
                                disabled={!canBeSubmitted()}
                                onClick={handleSave}
                            >
                                {T.translate("game.save")}
                            </Button>
                        </FuseAnimate>
                        <FuseAnimate animation="transition.slideRightIn" delay={300}>
                            <Button
                                className="whitespace-no-wrap"
                                variant="contained"
                                onClick={queryGameMngGameDetails}
                            >
                                {T.translate("game.queryDetails")}
                            </Button>
                        </FuseAnimate>
                    </div>
                )
            }
            contentToolbar={
                <Tabs
                    value={tabValue}
                    onChange={handleChangeTab}
                    indicatorColor="secondary"
                    textColor="secondary"
                    variant="scrollable"
                    scrollButtons="auto"
                    classes={{ root: "w-full h-64" }}
                >
                    <Tab className="h-64 normal-case" label={T.translate("game.basic_info")} />

                    {(form && form.metadata) && (<Tab className="h-64 normal-case" label={T.translate("game.metadata_tab")} />)}
                </Tabs>
            }
            content={
                form && (
                    <div className="p-16 sm:p-24 max-w-2xl">

                        <Formik
                            initialValues={{ ...form }}
                            enableReinitialize
                            onSubmit={handleSave}
                            validationSchema={Yup.object().shape({
                                ...basicInfoFormValidationsGenerator(T)
                            })}

                        >

                            {(props) => {
                                const {
                                    values,
                                    touched,
                                    errors,
                                    setFieldTouched,
                                    handleChange,
                                    handleSubmit
                                } = props;

                                setErrors(errors);
                                const onChange = (fieldName) => (event) => {
                                    event.persist();
                                    setFieldTouched(fieldName);
                                    handleChange(event);
                                    formHandleChange(event);
                                };

                                return (
                                    <form noValidate onSubmit={handleSubmit}>
                                        {tabValue === 0 && <BasicInfo dataSource={values} {...{ T, onChange, canWrite, errors, touched, readGameDetailsResult }} />}
                                        {tabValue === 1 && <Metadata dataSource={values} T={T} />}
                                    </form>
                                );
                            }}
                        </Formik>



                    </div>
                )
            }
            innerScroll
        />
    )
}

export default withReducer('GameManagement', reducer)(Game);
