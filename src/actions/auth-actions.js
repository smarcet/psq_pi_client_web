import {createAction, getRequest, postRequest} from "./base-actions";
import {authErrorHandler} from "./base-actions";
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";
export const SET_LOGGED_USER   = 'SET_LOGGED_USER';
export const LOGOUT_USER       = 'LOGOUT_USER';
export const REQUEST_USER_INFO = 'REQUEST_USER_INFO';
export const RECEIVE_USER_INFO = 'RECEIVE_USER_INFO';
export const REQUEST_AUTH      = 'REQUEST_AUTH';
export const RECEIVE_AUTH      = 'RECEIVE_AUTH';
export const REQUEST_DEVICE_REGISTRATION = 'REQUEST_DEVICE_REGISTRATION';
export const RECEIVE_DEVICE_REGISTRATION = 'RECEIVE_DEVICE_REGISTRATION';

export const doLogin = (username, password, history = null, backUrl = null ) => (dispatch, getState) => {

    let apiBaseUrl        = process.env['API_BASE_URL'];

    postRequest(
        createAction(REQUEST_AUTH),
        createAction(RECEIVE_AUTH),
        `${apiBaseUrl}/token`,
        {
            "email": username,
            "password": password
        },
        authErrorHandler,
    )({})(dispatch).then((payload) => {
        let { response } = payload;
        return getRequest
        (
            createAction(REQUEST_USER_INFO),
            createAction(RECEIVE_USER_INFO),
            `${apiBaseUrl}/users/me?token=${response.token}`,
            authErrorHandler
        )({})(dispatch, getState).then(() => {
           // dispatch(stopLoading());

            let { currentUser, currentDevice } = getState().loggedUserState;
            if( currentUser == null || currentUser == undefined){
                swal("ERROR", T.translate("User not set"), "error");
                dispatch({
                    type: LOGOUT_USER,
                    payload: {}
                });
                return;
            }

            let managedDevices = currentUser.assigned_devices.filter((device, idx) => {
                return device.id === currentDevice.id;
            })

            let assignedDevices = currentUser.managed_devices.filter((device, idx) => {
                return device.id === currentDevice.id;
            })

            let ownedDevices = currentUser.owned_devices.filter((device, idx) => {
                return device.id === currentDevice.id;
            })

            let devices = [...managedDevices, ...assignedDevices, ...ownedDevices];

            if(devices.length == 0){
                swal("ERROR", T.translate("User is not authorized to use this device"), "error");
                dispatch({
                    type: LOGOUT_USER,
                    payload: {}
                });
                return;
            }
            console.log(`redirecting to ${backUrl}`)
            history.push(backUrl);
        })
    });

}

export const doVerification = ()  => (dispatch) => {
    let apiBaseUrl        = process.env['PI_API_BASE_URL'];

    return postRequest(
        createAction(REQUEST_DEVICE_REGISTRATION),
        createAction(RECEIVE_DEVICE_REGISTRATION),
        `${apiBaseUrl}/devices/current/registration`,
        {},
        authErrorHandler,
    )({})(dispatch);
}

export const onUserAuth = (accessToken, idToken) => (dispatch) => {
    dispatch({
        type: SET_LOGGED_USER,
        payload: {accessToken, idToken}
    });
}

export const doLogout = () => (dispatch) => {
    dispatch({
        type: LOGOUT_USER,
        payload: {}
    });
}