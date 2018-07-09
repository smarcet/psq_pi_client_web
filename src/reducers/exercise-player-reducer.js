import{ LOGOUT_USER } from '../actions/auth-actions';
import {RETRIEVED_EXERCISE, RETRIEVED_AVAILABLE_EXERCISES, EXERCISE_STARTED} from "../actions/exercises-actions";

const DEFAULT_STATE = {
   currentExercise: null,
   currentRecordingJob: null
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
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
            break;
        default:
            return state;
    }
}

export default exercisePlayerReducer;