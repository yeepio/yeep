import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import {
  reducer as sessionReducer,
  initialState as sessionInitialState,
} from './session/sessionStore';
import { reducer as modalReducer, initialState as modalInitialState } from './modals/modalStore';

const rootReducer = combineReducers({
  session: sessionReducer,
  modal: modalReducer,
});

const preloadedState = {
  session: sessionInitialState,
  modal: modalInitialState,
};

const middleware = [ReduxThunk];

export const store = createStore(rootReducer, preloadedState, applyMiddleware(...middleware));
