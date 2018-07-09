import T from "i18n-react/dist/i18n-react";
import request from 'superagent';
import URI from "urijs";
let http = request;
import 'sweetalert2/dist/sweetalert2.css';
import swal from 'sweetalert2';
export const VALIDATE           = 'VALIDATE';
const LOGOUT_USER               = 'LOGOUT_USER';
export const START_LOADING = 'START_LOADING';
export const STOP_LOADING  = 'STOP_LOADING';

export const defaultErrorHandler = (err, res) => (dispatch) => {
    let text = res.body;
    if(res.body != null && res.body.messages instanceof Array) {
        let messages = res.body.messages.map( m => {
            if (m instanceof Object) return m.message
            else return m;
        })
        text = messages.join('\n');
    }
    swal(res.statusText, text, "error");
}

export const createAction = type => payload => ({
    type,
    payload
});

export const startLoading = createAction(START_LOADING);
export const stopLoading  = createAction(STOP_LOADING);

const xhrs = {};

const cancel = (key) => {
    if(xhrs[key]) {
        xhrs[key].abort();
        console.log(`aborted request ${key}`);
        delete xhrs[key];
    }
}

const schedule = (key, req) => {
    console.log(`scheduling ${key}`);
    xhrs[key] = req;
};

const isObjectEmpty = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object ;
}

export const getRequest =(
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => dispatch => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    let key = url.toString();

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    cancel(key);

    return new Promise((resolve, reject) => {
        let req = http.get(url.toString())
            .timeout({
                response: 60000,
                deadline: 60000,
            })
            .end(responseHandler(dispatch, receiveActionCreator, errorHandler, resolve, reject))

        schedule(key, req);
    });
};

export const putRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => dispatch => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        http.put(url.toString())
            .send(payload)
            .end(responseHandler(dispatch, receiveActionCreator, errorHandler, resolve, reject))
    });
};

export const deleteRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler  = defaultErrorHandler,
    requestActionPayload = {}
) => (params) => (dispatch) => {
    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        http.delete(url)
            .send(payload)
            .end(responseHandler(dispatch, receiveActionCreator, errorHandler, resolve, reject))
    });
};

export const postRequest = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    payload,
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => dispatch => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {
        http.post(url)
            .send(payload)
            .end(responseHandler(dispatch, receiveActionCreator, errorHandler, resolve, reject))
    });
};

export const postFile = (
    fileFieldName,
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    file,
    fileMetadata = {},
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => dispatch => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {

        const req = http.post(url)
            .attach(fileFieldName, file);

        if(!isObjectEmpty(fileMetadata)) {
            Object.keys(fileMetadata).forEach(function (key) {
                let value = fileMetadata[key];
                req.field(key, value);
            });
        }

        req.end(responseHandler(dispatch, receiveActionCreator, errorHandler, resolve, reject));
    });
};

export const putFile = (
    requestActionCreator,
    receiveActionCreator,
    endpoint,
    file = null,
    fileMetadata = {},
    errorHandler = defaultErrorHandler,
    requestActionPayload = {}
) => (params = {}) => dispatch => {

    let url = URI(endpoint);

    if(!isObjectEmpty(params))
        url = url.query(params);

    if(requestActionCreator && typeof requestActionCreator === 'function')
        dispatch(requestActionCreator(requestActionPayload));

    return new Promise((resolve, reject) => {

        const req = http.put(url);

        if(file != null){
            req.attach('file', file);
        }

        if(!isObjectEmpty(fileMetadata)) {
            Object.keys(fileMetadata).forEach(function (key) {
                let value = fileMetadata[key];
                req.field(key, value);
            });
        }

        req.end(responseHandler(dispatch, receiveActionCreator, errorHandler, resolve, reject));
    });
};

const responseHandler =
    ( dispatch, receiveActionCreator, errorHandler, resolve, reject ) =>
        (err, res) => {
            if (err || !res.ok) {
                if(errorHandler) {
                    errorHandler(err, res)(dispatch);
                }
                return reject({ err, res, dispatch })
            }
            let json = res.body;
            if(typeof receiveActionCreator === 'function') {
                dispatch(receiveActionCreator({response: json}));
                return resolve({response: json});
            }
            if(receiveActionCreator != null )
                dispatch(receiveActionCreator);
            return resolve({response: json});
        }


export const authErrorHandler = (err, res) => (dispatch) => {
    let code = err.status;
    dispatch(stopLoading());

    let msg = '';

    switch (code) {
        case 403:
            swal("ERROR", T.translate("Not Authorized user"), "warning");
            break;
        case 400:
            swal("ERROR", T.translate("Invalid User"), "warning");
            break;
        case 401:
            swal("ERROR", T.translate("Not Authenticated User"), "error");
            dispatch({
                type: LOGOUT_USER,
                payload: {
                    persistStore: true
                }
            });
            break;
        case 404:
            msg = err.message;
            swal("Not Found", msg, "warning");
            break;
        case 412:
            for (var [key, value] of Object.entries(err.response.body)) {
                msg += '- ' + value + '<br>';
            }
            swal("Validation error", msg, "warning");
            dispatch({
                type: VALIDATE,
                payload: {errors: err.response.body}
            });
            break;
        default:
            swal("ERROR", T.translate("Server Error"), "error");
    }
}

export const fetchErrorHandler = (response) => {
    let code = response.status;
    let msg = response.statusText;

    switch (code) {
        case 403:
            swal("ERROR", T.translate("User not Authorized"), "warning");
            break;
        case 401:
            swal("ERROR", T.translate("Session expired"), "error");
            break;
        case 412:
            swal("ERROR", msg, "warning");
        case 500:
            swal("ERROR", T.translate("Server Error"), "error");
    }
}

export const fetchResponseHandler = (response) => {
    if (!response.ok) {
        throw response;
    } else {
        return response.json();
    }
}

export const showMessage = (title, text, type, callback = {}) => (dispatch) => {
    dispatch(stopLoading());
    swal({title, text, type}).then((result) => {
        if (result.value && typeof callback === 'function') {
            callback();
        }
    });
}
