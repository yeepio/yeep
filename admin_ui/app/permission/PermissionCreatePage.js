import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const PermissionCreatePage = () => {
  useDocumentTitle('Create permission');
  return (
    <React.Fragment>
      <h1>Create new permission</h1>
      <p>
         <Link to="/permissions">Return to the list of permissions</Link>
      </p>
    </React.Fragment>
  );
};

export default PermissionCreatePage;
