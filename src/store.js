import { createStore, applyMiddleware, compose} from 'redux';
import loggedUserReducer from './reducers/auth-reducer'
import baseReducer from './reducers/base-reducer'
import thunk from 'redux-thunk';
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import exercisesListReducer from "./reducers/exercises-list-reducer";
import exercisePlayerReducer from "./reducers/exercise-player-reducer";
import {getLanguage, USER_LOCALE_COOKIE_NAME} from "./constants";
import { bake_cookie, read_cookie, delete_cookie } from 'sfcookies';
// default: localStorage if web, AsyncStorage if react-native

const config = {
    key: 'root_psq_pi_client',
    storage,
}

const reducers = persistCombineReducers(config, {
    loggedUserState: loggedUserReducer,
    baseState: baseReducer,
    exercisesListState: exercisesListReducer,
    exercisePlayerState: exercisePlayerReducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

const onRehydrateComplete = () => {
    // repopulate access token on global access variable
    let currentUser = store.getState().loggedUserState.currentUser;
    if(currentUser != null){
        let language = getLanguage(currentUser.locale);
        if(language != null){
            bake_cookie(USER_LOCALE_COOKIE_NAME, language);
            console.log(`user language is ${language}`);
            T.setTexts(require(`./i18n/${language}.json`));
        }
    }
    window.accessToken = store.getState().loggedUserState.accessToken;
}

export const persistor = persistStore(store, null, onRehydrateComplete);
export default store;