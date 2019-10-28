import React from 'react';
import { Router } from '@reach/router';
import UserListPage from './UserListPage';
import UserCreatePage from './UserCreatePage';
import UserEditPage from './UserEditPage';
// import UserEditMemberships from './UserEditMemberships';
// import UserEditSystemPermissions from './UserEditSystemPermissions';

const UserMaster = () => {
  return (
    <Router className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <UserListPage path="/" />
      <UserCreatePage path="/create" />
      <UserEditPage path="/:userId/edit/*" />
      {/* <UserEditMemberships path="/:userId/edit/memberships" />
      <UserEditSystemPermissions path="/:userId/edit/system-permissions" /> */}
    </Router>
  );
};

export default UserMaster;
