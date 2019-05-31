import { combineReducers, createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import {
  reducer as sessionReducer,
  initialState as sessionInitialState,
} from './session/sessionStore';
import { reducer as modalReducer, initialState as modalInitialState } from './modals/modalStore';
import { reducer as orgReducer, initialState as orgInitialState } from './org/orgStore';
import { reducer as roleReducer, initialState as roleInitialState } from './role/roleStore';

const rootReducer = combineReducers({
  session: sessionReducer,
  modal: modalReducer,
  org: orgReducer,
  role: roleReducer,
});

const preloadedState = {
  session: sessionInitialState,
  modal: modalInitialState,
  org: orgInitialState,
  role: roleInitialState,
};

const middleware = [ReduxThunk];

if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger'); // eslint-disable-line global-require
  const freeze = require('redux-freeze');

  middleware.push(createLogger({ level: 'info', collapsed: true }), freeze);
}

export const store = createStore(rootReducer, preloadedState, applyMiddleware(...middleware));
