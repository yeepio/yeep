import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import ReduxThunk from 'redux-thunk';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
  reducer as sessionReducer,
  initialState as sessionInitialState,
} from './session/sessionStore';
import { reducer as roleReducer, initialState as roleInitialState } from './role/roleStore';
import {
  reducer as permissionReducer,
  initialState as permissionInitialState,
} from './permission/permissionStore';
import { reducer as orgReducer, initialState as orgInitialState } from './org/orgStore';
import { reducer as userReducer, initialState as userInitialState } from './user/userStore';

const sessionPersistConfig = {
  key: 'session',
  storage,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  session: persistReducer(sessionPersistConfig, sessionReducer),
  role: roleReducer,
  permission: permissionReducer,
  org: orgReducer,
  user: userReducer,
});

const preloadedState = {
  session: sessionInitialState,
  role: roleInitialState,
  permission: permissionInitialState,
  org: orgInitialState,
  user: userInitialState,
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
