import React from 'react';
import { Router } from '@reach/router';
import PermissionListPage from './PermissionListPage';
import PermissionCreatePage from './PermissionCreatePage';
import PermissionEditPage from './PermissionEditPage';

const PermissionMaster = () => {
  return (
    <Router className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <PermissionListPage path="/" />
      <PermissionCreatePage path="/create" />
      <PermissionEditPage path="/:permissionId/edit" />
    </Router>
  );
};

export default PermissionMaster;
