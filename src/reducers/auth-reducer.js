import {LOGOUT_USER, RECEIVE_USER_INFO, RECEIVE_AUTH, RECEIVE_DEVICE_REGISTRATION} from '../actions/auth-actions';
import jwtDecode from 'jwt-decode';

const DEFAULT_STATE = {
    isLoggedUser: false,
    token: null,
    decodedToken: null,
    currentUser: null,
    currentDevice:null
};

const loggedUserReducer = (state = DEFAULT_STATE, action) => {

    if (action.type === RECEIVE_AUTH) {
        let { response } = action.payload;
        window.token = response.token;
        return {...state, token: response.token, decodedToken: jwtDecode(response.token) };
    }
    if(action.type === RECEIVE_DEVICE_REGISTRATION){
        let { response } = action.payload;
        return {...state, currentDevice: response};
    }
    if(action.type === LOGOUT_USER){
        window.accessToken = null;
        return DEFAULT_STATE
    }
    if(action.type === RECEIVE_USER_INFO){
        let { response } = action.payload;
        return {...state, isLoggedUser:true, currentUser: response};
    }
    return state;
}

export default loggedUserReducer