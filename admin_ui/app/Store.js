import React from 'react';
import SessionStore from './session/SessionStore';

// create react context
const context = React.createContext();

// create store (singleton)
const store = {
  session: new SessionStore(),
};

// set context value
context.Provider.defaultProps = {
  value: store,
};

export default context;
