import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import {
  reducer as sessionReducer,
  initialState as sessionInitialState,
} from './session/sessionStore';

const rootReducer = combineReducers({
  session: sessionReducer,
});

const preloadedState = {
  session: sessionInitialState,
};

const middleware = [ReduxThunk];

export const store = createStore(rootReducer, preloadedState, applyMiddleware(...middleware));
