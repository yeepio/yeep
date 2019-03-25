import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const UserCreatePage = () => {
  useDocumentTitle('Create user');
  return (
    <React.Fragment>
      <h1>Create new user</h1>
      <p>
        <Link to="/users">Return to the list of users</Link>
      </p>
    </React.Fragment>
  );
};

export default UserCreatePage;
