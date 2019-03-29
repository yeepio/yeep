import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';

const OrgEditUserMemberships = ({ orgId }) => {
  useDocumentTitle(`Organization name: User memberships`);
  return (
    <React.Fragment>
      <h1 className="mb-6">&quot;Organization name&quot;: User memberships</h1>
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
        <Link to={`/organizations/${orgId}/edit/roles`}>&laquo; Roles</Link>
      </p>
    </React.Fragment>
  );
};

OrgEditUserMemberships.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditUserMemberships;
