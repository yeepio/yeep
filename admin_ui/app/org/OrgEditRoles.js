import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';

const OrgEditRoles = ({ orgId }) => {
  useDocumentTitle(`Organization name: Roles`);
  return (
    <React.Fragment>
      <h1 className="mb-6">&quot;Organization name&quot;: Roles</h1>
      <TabLinks
        className="mb-6"
        links={[
          {
            label: 'Org details',
            to: `/organizations/${orgId}/edit`,
          },
          {
            label: 'Permissions',
            to: `/organizations/${orgId}/edit/permissions`,
          },
          {
            label: 'Roles',
            to: `/organizations/${orgId}/edit/roles`,
          },
          {
            label: 'Users',
            to: `/organizations/${orgId}/edit/users`,
          },
        ]}
      />
      <p className="flex">
        <Link to={`/organizations/${orgId}/edit/permissions`}>&laquo; Permissions</Link>
        <Link to={`/organizations/${orgId}/edit/users`} className="ml-auto">Users &raquo;</Link>
      </p>
    </React.Fragment>
  );
};

OrgEditRoles.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditRoles;
