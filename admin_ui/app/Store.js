import React from 'react';
import RoleStore from './role/RoleStore';

// create react context
const context = React.createContext();

// create store (singleton)
const store = {
  role: new RoleStore(),
};

// set context value
context.Provider.defaultProps = {
  value: store,
};

export default context;
