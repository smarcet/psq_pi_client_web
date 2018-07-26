import{ LOGOUT_USER } from '../actions/auth-actions';
import { RETRIEVED_EXERCISE,
    RETRIEVED_AVAILABLE_EXERCISES,
    EXERCISE_STARTED,
    EXERCISE_STARTED_ADD_SECOND,
    SET_EXERCISE_STATUS,
    SET_STREAM_STATUS
} from "../actions/exercises-actions";

import {EXERCISE_INITIAL_STATUS } from "../models/exercise";
import {STREAM_STATUS_OK} from '../models/stream';

const DEFAULT_STATE = {
   currentExercise: null,
   currentRecordingJob: null,
   timer : 0,
   exerciseStatus : EXERCISE_INITIAL_STATUS,
   streamStatus: STREAM_STATUS_OK,
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
        case RETRIEVED_AVAILABLE_EXERCISES:{
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
        default:
            return state;
    }
}

export default exercisePlayerReducer;