import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const OrgCreate = () => {
  useDocumentTitle('Create organization');
  return (
    <React.Fragment>
      <h1>Create new organization</h1>
      <p>
        Return to the <Link to="/organizations">list of organizations</Link>
      </p>
    </React.Fragment>
  );
};

export default OrgCreate;
