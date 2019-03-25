import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const RoleCreatePage = () => {
  useDocumentTitle('Create role');
  return (
    <React.Fragment>
      <h1>Create new role</h1>
      <p>
        <Link to="/roles">Return to the list of roles</Link>
      </p>
    </React.Fragment>
  );
};

export default RoleCreatePage;
