import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import ButtonLink from '../../components/ButtonLink';

const UserListPage = () => {
  useDocumentTitle('Users');
  return (
    <React.Fragment>
      <ButtonLink to="create" className="float-right">Create new</ButtonLink>
      <h1 className="mb-6">Users</h1>
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default UserListPage;
