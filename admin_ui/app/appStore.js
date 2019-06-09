import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
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

// We need ReduxThunk in order to enable async flows in Redux
const middleware = [ReduxThunk];
let enhancer = applyMiddleware(...middleware);

// Turn on a few more middleware goodies when we're not in proudction
if (process.env.NODE_ENV !== 'production') {
  const { createLogger } = require('redux-logger'); // eslint-disable-line global-require
  const freeze = require('redux-freeze');
  middleware.push(createLogger({ level: 'info', collapsed: true }), freeze);
  // Let's also enable the use of the Redux devtool extension
  // (lovely visualisation of state plus time travel!)
  const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        })
      : compose;
  enhancer = composeEnhancers(applyMiddleware(...middleware));
}

export const store = createStore(rootReducer, preloadedState, enhancer);
