import React from 'react';
import { Router } from '@reach/router';
import TopNav from '../../components/TopNav';
import AsideNav from '../../components/AsideNav';
import DashboardPage from './DashboardPage';

// Use react-loadable to split pages into their own bundles that
// will be dynamically loaded on runtime
import Loadable from 'react-loadable';

// The loading indicator that will be shown on the RHS
// of the main interface while a page component is loading
import LoadingIndicator from '../../components/LoadingIndicator';


const AsyncOrganization = Loadable({
  loader: () => import(/* webpackChunkName: "org" */ '../org/OrgPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncPermission = Loadable({
  loader: () => import(/* webpackChunkName: "permission" */ '../permission/PermissionPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncRole = Loadable({
  loader: () => import(/* webpackChunkName: "role" */ '../role/RolePage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const AsyncUser = Loadable({
  loader: () => import(/* webpackChunkName: "user" */ '../user/UserPage'),
  loading: LoadingIndicator,
  delay: 300, // 0.3 seconds
});

const DashboardSection = () => {
  return (
    <React.Fragment>
      <TopNav />
      <div className="mx-auto flex">
        <AsideNav />
        <Router>
          <DashboardPage path="/" />
          <AsyncOrganization path="organizations/*" />
          <AsyncPermission path="permissions/*" />
          <AsyncRole path="roles/*" />
          <AsyncUser path="users/*" />
        </Router>
      </div>
    </React.Fragment>
  );
};

export default DashboardSection;
