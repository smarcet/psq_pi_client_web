import {createAction, getRequest, deleteRequest, putRequest, postRequest, VALIDATE, stopLoading} from "./base-actions";
import {authErrorHandler, START_LOADING, STOP_LOADING} from "./base-actions";
import {DEFAULT_PAGE_SIZE} from "../constants";
import swal from "sweetalert2";
import T from "i18n-react/dist/i18n-react";

export const RETRIEVED_AVAILABLE_EXERCISES = 'RETRIEVED_AVAILABLE_EXERCISES';
export const RETRIEVED_EXERCISE = 'RETRIEVED_EXERCISE';
export const EXERCISE_STARTED = 'EXERCISE_STARTED';
export const EXERCISE_SUBMITTED = 'EXERCISE_SUBMITTED';
export const EXERCISE_STARTED_ADD_SECOND = 'EXERCISE_STARTED_ADD_SECOND';
export const EXERCISE_ABORTED = 'EXERCISE_ABORTED';
export const SET_EXERCISE_STATUS = 'EXERCISE_INITIAL_STATUS';
export const SET_STREAM_STATUS = 'SET_STREAM_STATUS';
export const BACKGROUND_PROCESS_CAPTURE_OK = 'BACKGROUND_PROCESS_CAPTURE_OK';
export const BACKGROUND_PROCESS_CAPTURE_ERROR = 'BACKGROUND_PROCESS_CAPTURE_ERROR';
export const BACKGROUND_PROCESS_STREAMING_OK = 'BACKGROUND_PROCESS_STREAMING_OK';
export const BACKGROUND_PROCESS_STREAMING_ERROR = 'BACKGROUND_PROCESS_STREAMING_ERROR';

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

    let {loggedUserState, exercisePlayerState} = getState();
    let {currentUser, currentDevice} = loggedUserState;
    let {timer} = exercisePlayerState
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    let params = {
        timer: timer
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

export const abortExercise = (exercise, job) => (dispatch, getState) => {

    let {loggedUserState, exercisePlayerState} = getState();
    let {currentUser, currentDevice} = loggedUserState;
    let {timer} = exercisePlayerState
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    let params = {
        timer: timer
    };

    return deleteRequest(
        createAction(START_LOADING),
        createAction(EXERCISE_ABORTED),
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


const backgroundProcessCaptureErrorHandler = (err, res) => (dispatch) => {
    dispatch({
        type: BACKGROUND_PROCESS_CAPTURE_ERROR,
        payload: {}
    });
}

const backgroundProcessStreamingErrorHandler = (err, res) => (dispatch) => {
    dispatch({
        type: BACKGROUND_PROCESS_STREAMING_ERROR,
        payload: {}
    });
}

export const checkBackgroundProcessCapture = () => (dispatch, getState) => {
    let { exercisePlayerState } = getState();
    let {currentRecordingJob} = exercisePlayerState;
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    return getRequest(
       null,
        createAction(BACKGROUND_PROCESS_CAPTURE_OK),
        `${apiBaseUrl}/processes/${currentRecordingJob.pid_capture}/exists`,
        backgroundProcessCaptureErrorHandler,
    )({})(dispatch);
}

export const checkBackgroundProcessStreaming = () => (dispatch, getState) => {
    let { exercisePlayerState } = getState();
    let {currentRecordingJob} = exercisePlayerState;
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    return getRequest(
        null,
        createAction(BACKGROUND_PROCESS_STREAMING_OK),
        `${apiBaseUrl}/processes/${currentRecordingJob.pid_stream}/exists`,
        backgroundProcessStreamingErrorHandler,
    )({})(dispatch);
}

export const pingRecordingJob = () => (dispatch, getState) => {
    let { exercisePlayerState } = getState();
    let {currentRecordingJob} = exercisePlayerState;
    let apiBaseUrl = process.env['PI_API_BASE_URL'];

    return putRequest(
        null,
        createAction(BACKGROUND_PROCESS_STREAMING_OK),
        `${apiBaseUrl}/record-jobs/${currentRecordingJob.id}/ping`,
        {},
        backgroundProcessStreamingErrorHandler,
    )({})(dispatch);
}