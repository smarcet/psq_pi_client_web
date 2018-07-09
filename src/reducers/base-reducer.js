import { START_LOADING, STOP_LOADING } from '../actions/base-actions';
import { LOGOUT_USER } from '../actions/auth-actions';

const DEFAULT_STATE = {
    loading: false,

}

const baseReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            console.log('START_LOADING')
            return {...state, loading: true};
            break;
        case STOP_LOADING:
            console.log('STOP_LOADING')
            return {...state, loading: false};
        break;

        default:
            return state;
            break;
    }
}

export default baseReducer