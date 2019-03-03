import React from 'react';
import Loadable from 'react-loadable';
import { Router } from '@reach/router';
import './main.css';
import LoadingIndicator from '../components/LoadingIndicator';

const AsyncLogin = Loadable({
  loader: () => import(/* webpackChunkName: "login" */ './session/LoginPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncDashboard = Loadable({
  loader: () => import(/* webpackChunkName: "dashboard" */ './dashboard/DashboardPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncOrganization = Loadable({
  loader: () => import(/* webpackChunkName: "org" */ './org/OrgPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncPermission = Loadable({
  loader: () => import(/* webpackChunkName: "permission" */ './permission/PermissionPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncRole = Loadable({
  loader: () => import(/* webpackChunkName: "role" */ './role/RolePage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncUser = Loadable({
  loader: () => import(/* webpackChunkName: "user" */ './user/UserPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

/**
 * The top level component / wrapper
 * encompassing the Header, Nav and PageWrapper
 */
const App = () => {
  return (
    <React.Fragment>
      <Router>
        <AsyncLogin path="/login" />
        <AsyncDashboard path="/" />
        <AsyncOrganization path="/organizations/*" />
        <AsyncPermission path="/permissions/*" />
        <AsyncRole path="/roles/*" />
        <AsyncUser path="/users/*" />
      </Router>
    </React.Fragment>
  );
};

export default App;
