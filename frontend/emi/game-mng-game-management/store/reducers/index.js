import {combineReducers} from 'redux';
import games from './Games.reducer';

const reducer = combineReducers({
    games,
});

export default reducer;
