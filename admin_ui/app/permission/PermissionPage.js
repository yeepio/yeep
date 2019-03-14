import React from 'react';
import { Router, Link } from '@reach/router';
import PermissionListPage from './PermissionListPage';
import PermissionCreatePage from './PermissionCreatePage';
import PermissionEditPage from './PermissionEditPage';

const PermissionMaster = () => {
  return (
    <React.Fragment>
      <h1>Permission Master (WIP)</h1>
      <ul>
        <li>
          <Link to="/">Back to dashboard</Link>
        </li>
        <li>
          <Link to="">List permissions</Link>
        </li>
        <li>
          <Link to="create">Create permission</Link>
        </li>
        <li>
          <Link to="123/edit">Edit permission 123</Link>
        </li>
      </ul>

      <Router>
        <PermissionListPage path="/" />
        <PermissionCreatePage path="/create" />
        <PermissionEditPage path="/:permissionId/edit" />
      </Router>
    </React.Fragment>
  );
};

export default PermissionMaster;
