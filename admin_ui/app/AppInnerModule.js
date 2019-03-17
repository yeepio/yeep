import React from 'react';
import { Router } from '@reach/router';
import TopNav from '../components/TopNav';
import AsideNav from '../components/AsideNav';

// The initial / welcome page needs to be part of the main bundle
import DashboardPage from './dashboard/DashboardPage';

// The loading indicator that will be shown on the RHS
// of the main interface while a page component is loading asynchronously
import LoadingIndicator from '../components/LoadingIndicator';

/*
  For all the other pages (Orgs, Perms, Roles, Users) we will make use
  of react-loadable to async-load them as needed. The webpack build process
  will result in each page component having it's own bundle
 */
import Loadable from 'react-loadable';

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

const AppInnerModule = () => {
  return (
    <React.Fragment>
      <TopNav />
      <div className="mx-auto flex">
        <AsideNav />
        <div className="leading-normal p-4 sm:p-8 max-w-2xl">
          <Router>
            <DashboardPage path="/" />
            <AsyncOrganization path="organizations/*" />
            <AsyncPermission path="permissions/*" />
            <AsyncRole path="roles/*" />
            <AsyncUser path="users/*" />
          </Router>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AppInnerModule;
