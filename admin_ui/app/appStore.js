import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import {
  reducer as sessionReducer,
  initialState as sessionInitialState,
} from './session/sessionStore';
import { reducer as modalReducer, initialState as modalInitialState } from './modals/modalStore';
import { reducer as orgReducer, initialState as orgInitialState } from './org/orgStore';

const rootReducer = combineReducers({
  session: sessionReducer,
  modal: modalReducer,
  org: orgReducer,
});

const preloadedState = {
  session: sessionInitialState,
  modal: modalInitialState,
  org: orgInitialState,
};

const middleware = [ReduxThunk];

export const store = createStore(rootReducer, preloadedState, applyMiddleware(...middleware));
