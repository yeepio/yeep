import React from 'react';
import SessionStore from './session/SessionStore';
import OrgStore from './org/OrgStore';
import PermissionStore from './permission/PermissionStore';

// create react context
const context = React.createContext();

// create store (singleton)
const store = {
  session: new SessionStore(),
  org: new OrgStore(),
  permission: new PermissionStore()
};

// set context value
context.Provider.defaultProps = {
  value: store,
};

export default context;
