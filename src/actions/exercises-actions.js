import {createAction, getRequest, deleteRequest, putRequest, postRequest} from "./base-actions";
import {authErrorHandler, START_LOADING, STOP_LOADING} from "./base-actions";
import {DEFAULT_PAGE_SIZE} from "../constants";

export const RETRIEVED_AVAILABLE_EXERCISES = 'RETRIEVED_AVAILABLE_EXERCISES';
export const RETRIEVED_EXERCISE = 'RETRIEVED_EXERCISE';
export const EXERCISE_STARTED = 'EXERCISE_STARTED';
export const EXERCISE_SUBMITTED = 'EXERCISE_SUBMITTED';
export const EXERCISE_STARTED_ADD_SECOND = 'EXERCISE_STARTED_ADD_SECOND';
export const SET_EXERCISE_STATUS = 'EXERCISE_INITIAL_STATUS';
export const SET_STREAM_STATUS = 'SET_STREAM_STATUS';

export const getAvailableExercises = (currentPage = 1, pageSize = DEFAULT_PAGE_SIZE, searchTerm = '', ordering = 'id') => (dispatch, getState) => {
    let {loggedUserState} = getState();
    let {token, currentDevice} = loggedUserState;
    let apiBaseUrl = process.env['API_BASE_URL'];

    let params = {
        token: token,
        page: currentPage,
        page_size: pageSize,
    };

    getRequest(
        createAction(START_LOADING),
        createAction(RETRIEVED_AVAILABLE_EXERCISES),
        `${apiBaseUrl}/devices/${currentDevice.id}/exercises`,
        authErrorHandler,
    )(params)(dispatch).then((payload) => {
        dispatch({
            type: STOP_LOADING,
            payload: {}
        });
    });
};

export const getExerciseById = (exerciseId) => (dispatch, getState) => {
    let {loggedUserState} = getState();
    let {token} = loggedUserState;
    let apiBaseUrl = process.env['API_BASE_URL'];

    let params = {
        token: token,
    };

    return getRequest(
        createAction(START_LOADING),
        createAction(RETRIEVED_EXERCISE),
        `${apiBaseUrl}/exercises/${exerciseId}`,
        authErrorHandler,
    )(params)(dispatch).then((payload) => {
        dispatch({
            type: STOP_LOADING,
            payload: {}
        });
    });
};

export const startExerciseRecordingJob = (exercise) => (dispatch, getState) => {

    let {loggedUserState} = getState();
    let {token, currentUser, currentDevice} = loggedUserState;
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    let params = {
        token: token,
        stream_key: currentDevice.stream_key
    };

    return postRequest(
        createAction(START_LOADING),
        createAction(EXERCISE_STARTED),
        `${apiBaseUrl}/devices/${currentDevice.id}/users/${currentUser.id}/exercises/${exercise.id}/record-jobs`,
        {},
        authErrorHandler,
    )(params)(dispatch).then((payload) => {
        dispatch({
            type: STOP_LOADING,
            payload: {}
        });
    });
}

export const addExerciseSecond = () => (dispatch) => {
    dispatch({
        type: EXERCISE_STARTED_ADD_SECOND,
        payload: {}
    });
}

export const setExerciseStatus = (status) => (dispatch) => {
    dispatch({
        type: SET_EXERCISE_STATUS,
        payload: status
    });
}

export const setStreamStatus = (status)  => (dispatch) => {
    dispatch({
        type: SET_STREAM_STATUS,
        payload: status
    });
}

export const stopExerciseRecordingJob = (exercise, job) => (dispatch, getState) => {

    let {loggedUserState} = getState();
    let {token, currentUser, currentDevice} = loggedUserState;
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    let params = {
        token: token,
    };

    return putRequest(
        createAction(START_LOADING),
        createAction(EXERCISE_SUBMITTED),
        `${apiBaseUrl}/devices/${currentDevice.id}/users/${currentUser.id}/exercises/${exercise.id}/record-jobs/${job.id}`,
        {},
        authErrorHandler,
    )(params)(dispatch).then((payload) => {
        dispatch({
            type: STOP_LOADING,
            payload: {}
        });
    });
}

