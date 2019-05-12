import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import Store from '../Store';
import OrgEditRolesModals from './OrgEditRolesModals';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';
import Button from '../../components/Button';
import Grid from '../../components/Grid';
import * as modalTypes from '../constants/modalTypes';

// Dummy data
let roleHeadings = [
  {
    label: 'Name',
    className: 'text-left',
  },
  {
    label: 'Permissions',
  },
  {
    label: 'Users',
  },
  {
    label: 'Actions',
    isSortable: false,
    className: 'text-right',
  },
];
let roleData = [
  {
    id: 1,
    name: 'blog_user',
    permissionCount: 1,
    userCount: 10,
  },
  {
    id: 2,
    name: 'blog_admin',
    permissionCount: 4,
    userCount: 2,
  },
];

const OrgEditRoles = ({ orgId }) => {
  // Load the store (we need access to store.org.currentModal$)
  const store = React.useContext(Store);

  // Set page title
  useDocumentTitle(`Organization name: Roles`);

  return (
    <React.Fragment>
      <OrgEditRolesModals />
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
      <fieldset className="mb-6">
        <legend>New role</legend>
        <Button
          onClick={() => {
            store.org.displayedModal$.next(modalTypes.ROLE_CREATE);
          }}
        >
          Create new role
        </Button>
        <p className="mt-4">
          Tip: If you want to create a role that is <em>not</em> scoped to the &quot;ORGNAME&quot;
          organization, please visit the <Link to="/roles">Roles</Link> page.
        </p>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Existing roles</legend>
        <Grid
          headings={roleHeadings}
          data={roleData}
          renderer={(role, index) => {
            return (
              <tr key={`roleRow${role.id}`} className={index % 2 ? `bg-grey-lightest` : ``}>
                <td className="p-2">
                  {role.name}
                </td>
                <td className="p-2 text-center">{role.permissionCount}</td>
                <td className="p-2 text-center">{role.userCount}</td>
                <td className="p-2 text-right">
                  <button
                    className="pseudolink"
                    onClick={(e) => {
                      e.preventDefault();
                      store.org.displayedModal$.next(modalTypes.ROLE_EDIT);
                    }}
                  >
                    Edit
                  </button>{' '}
                  <button
                    className="pseudolink"
                    onClick={(e) => {
                      e.preventDefault();
                      store.org.displayedModal$.next(modalTypes.ROLE_DELETE);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          }}
        />
      </fieldset>
      <p className="flex">
        <Link to={`/organizations/${orgId}/edit/permissions`}>&laquo; Permissions</Link>
        <Link to={`/organizations/${orgId}/edit/users`} className="ml-auto">
          Users &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

OrgEditRoles.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditRoles;
