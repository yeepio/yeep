import React from 'react';
import { Router, Link } from '@reach/router';
import RoleListPage from './RoleListPage';
import RoleCreatePage from './RoleCreatePage';
import RoleEditPage from './RoleEditPage';

const RoleMaster = () => {
  return (
    <React.Fragment>
      <h1>Role Master (WIP)</h1>
      <ul>
        <li>
          <Link to="/">Back to dashboard</Link>
        </li>
        <li>
          <Link to="">List roles</Link>
        </li>
        <li>
          <Link to="create">Create role</Link>
        </li>
        <li>
          <Link to="321/edit">Edit role 321</Link>
        </li>
      </ul>

      <Router>
        <RoleListPage path="/" />
        <RoleCreatePage path="/create" />
        <RoleEditPage path="/:roleId/edit" />
      </Router>
    </React.Fragment>
  );
};

export default RoleMaster;
