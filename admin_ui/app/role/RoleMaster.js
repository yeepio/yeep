import React from 'react';
import { Router } from '@reach/router';
import RoleListPage from './RoleListPage';
import RoleCreatePage from './RoleCreatePage';
import RoleEditPage from './RoleEditPage';

const RoleMaster = () => {
  return (
    <Router className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <RoleListPage path="/" />
      <RoleCreatePage path="/create" />
      <RoleEditPage path="/:roleId/edit" />
    </Router>
  );
};

export default RoleMaster;
