import React from 'react';
import { Router, Link } from '@reach/router';
import UserListPage from './UserListPage';
import UserCreatePage from './UserCreatePage';
import UserEditPage from './UserEditPage';

const UserMaster = () => {
  return (
    <React.Fragment>
      <h1>User Master (WIP)</h1>
      <ul>
        <li>
          <Link to="/">Back to dashboard</Link>
        </li>
        <li>
          <Link to="">List users</Link>
        </li>
        <li>
          <Link to="create">Create user</Link>
        </li>
        <li>
          <Link to="321/edit">Edit user 321</Link>
        </li>
      </ul>

      <Router>
        <UserListPage path="/" />
        <UserCreatePage path="/create" />
        <UserEditPage path="/:userId/edit" />
      </Router>
    </React.Fragment>
  );
};

export default UserMaster;
