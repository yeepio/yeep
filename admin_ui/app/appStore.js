import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import ReduxThunk from 'redux-thunk';
import {
  reducer as sessionReducer,
  initialState as sessionInitialState,
} from './session/sessionStore';
import { reducer as permissionModalsReducer, initialState as permissionModalsInitialState } from './modals/permissionModalsStore';
import { reducer as roleModalsReducer, initialState as roleModalsInitialState } from './modals/roleModalsStore';

const rootReducer = combineReducers({
  session: sessionReducer,
  permissionModals: permissionModalsReducer,
  roleModals: roleModalsReducer,
});

const preloadedState = {
  session: sessionInitialState,
  permissionModals: permissionModalsInitialState,
  roleModals: roleModalsInitialState,
};

const middleware = [
  ReduxThunk, // we need ReduxThunk to enable async flows in Redux
];

let composeEnhancers = compose;

// Turn on a few more middleware goodies when we're not in proudction
if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger'); // eslint-disable-line global-require
  const freeze = require('redux-freeze');
  middleware.push(createLogger({ level: 'info', collapsed: true }), freeze);

  // Let's also enable the use of the Redux devtool extension
  // (lovely visualisation of state plus time travel!)
  if (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    });
  }
}

export const store = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(applyMiddleware(...middleware))
);
