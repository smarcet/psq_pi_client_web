import{ LOGOUT_USER } from '../actions/auth-actions';
import {
    RETRIEVED_EXERCISE,
    RETRIEVED_AVAILABLE_EXERCISES,
    EXERCISE_STARTED,
    EXERCISE_STARTED_ADD_SECOND,
    SET_EXERCISE_STATUS,
    SET_STREAM_STATUS, BACKGROUND_PROCESS_CAPTURE_OK, BACKGROUND_PROCESS_CAPTURE_ERROR, BACKGROUND_PROCESS_STREAMING_OK,
    BACKGROUND_PROCESS_STREAMING_ERROR,
    EXERCISE_ABORTED, EXAM_SHARE_URL_CREATED
} from "../actions/exercises-actions";

import {EXERCISE_INITIAL_STATUS } from "../models/exercise";
import {STREAM_STATUS_OK} from '../models/stream';
import {BACKGROUND_PROCESS_CAPTURE_INITIAL_STATE,
    BACKGROUND_PROCESS_CAPTURE_WORKING_STATE,
    BACKGROUND_PROCESS_CAPTURE_ERROR_STATE,
    BACKGROUND_PROCESS_STREAMING_INITIAL_STATE,
    BACKGROUND_PROCESS_STREAMING_WORKING_STATE,
    BACKGROUND_PROCESS_STREAMING_ERROR_STATE
} from '../models/background_processes'

const DEFAULT_STATE = {
   currentExercise: null,
   currentRecordingJob: null,
   timer : 0,
   exerciseStatus : EXERCISE_INITIAL_STATUS,
   streamStatus: STREAM_STATUS_OK,
   backgroundProcessStreamingStatus: BACKGROUND_PROCESS_STREAMING_INITIAL_STATE,
   backgroundProcessCaptureStatus: BACKGROUND_PROCESS_CAPTURE_INITIAL_STATE,
   currentExamShareUrl : null
}

const exercisePlayerReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case RETRIEVED_EXERCISE: {
            return {
                ...state,
                currentExercise: action.payload.response
            };
        }
            break;
        case EXAM_SHARE_URL_CREATED:{
            return {
                ...state,
                currentExamShareUrl: action.payload.response.url
            };
        }
        break;
        case RETRIEVED_AVAILABLE_EXERCISES:{
            return DEFAULT_STATE;
        }
        break;
        case EXERCISE_ABORTED:
        {
            return DEFAULT_STATE;
        }
        break;
        case EXERCISE_STARTED:{
            return {
                ...state,
                currentRecordingJob: action.payload.response
            };
        }
       break;
        case SET_EXERCISE_STATUS:{
            return {
                ...state,
                exerciseStatus: payload
            };
        }
        break;
        case SET_STREAM_STATUS:{
            return {
                ...state,
                streamStatus: payload
            };
        }
        break;
        case EXERCISE_STARTED_ADD_SECOND:{
            return {
                ...state,
               timer: state.timer + 1
            };
        }
        break;
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        break;
        case BACKGROUND_PROCESS_CAPTURE_OK: {
            return {
                ...state,
                backgroundProcessCaptureStatus: BACKGROUND_PROCESS_CAPTURE_WORKING_STATE
            };
        }
        break;
        case BACKGROUND_PROCESS_CAPTURE_ERROR: {
            return {
                ...state,
                backgroundProcessCaptureStatus: BACKGROUND_PROCESS_CAPTURE_ERROR_STATE
            };
        }
            break;
        case BACKGROUND_PROCESS_STREAMING_OK: {
            return {
                ...state,
                backgroundProcessStreamingStatus: BACKGROUND_PROCESS_STREAMING_WORKING_STATE
            };
        }
            break;
        case BACKGROUND_PROCESS_STREAMING_ERROR: {
            return {
                ...state,
                backgroundProcessStreamingStatus: BACKGROUND_PROCESS_STREAMING_ERROR_STATE
            };
        }
            break;
        default:
            return state;
    }
}

export default exercisePlayerReducer;