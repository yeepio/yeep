import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import Store from '../Store';
import OrgEditPermissionsModals from './OrgEditPermissionsModals';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';
import Button from '../../components/Button';
import Grid from '../../components/Grid';

// Dummy data
let permissionHeadings = [
  {
    label: 'Name',
    className: 'text-left',
  },
  { label: 'Is system?' },
  { label: 'Role assignments' },
  { label: 'Actions', isSortable: false, className: 'text-right' },
];
let permissionData = [
  {
    id: 7,
    name: 'blog.read',
    systemPermission: false,
    roles: 1,
  },
  {
    id: 8,
    name: 'blog.modify',
    systemPermission: false,
    roles: 1,
  },
];

const OrgEditPermissions = ({ orgId }) => {

  // Load the store (we need access to store.org.currentModal$)
  const store = React.useContext(Store);

  // Set page title
  useDocumentTitle(`Organization name: Permissions`);

  return (
    <React.Fragment>
      <OrgEditPermissionsModals />
      <h1 className="mb-6">&quot;Organization name&quot;: Permissions</h1>
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
        <legend>New permissions</legend>
        <Button
          onClick={() => {
            store.org.currentModal$.next('CREATE');
          }}
        >
          Create new permission
        </Button>
        <p className="mt-4">
          Tip: If you want to create a permission that is <em>not</em> scoped to the
          &quot;ORGNAME&quot; organization, please{' '}
          <Link to="/permissions">visit the permissions page</Link>.
        </p>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Existing permissions</legend>
        <Grid
          headings={permissionHeadings}
          data={permissionData}
          renderer={(permissionData, index) => {
            return (
              <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
                <td className="p-2">
                  <Link to={`/permissions/${permissionData.id}/edit`}>{permissionData.name}</Link>
                </td>
                <td className="p-2 text-center">{permissionData.systemPermission ? 'Yes' : '-'}</td>
                <td className="p-2 text-center">{permissionData.roles}</td>
                <td className="p-2 text-right">
                  <Link to={`/permissions/${permissionData.id}/edit`}>Edit</Link>{' '}
                  <a href="/">Delete</a>
                </td>
              </tr>
            );
          }}
        />
      </fieldset>
      <p className="flex">
        <Link to={`/organizations/${orgId}/edit`}>&laquo; Organization details</Link>
        <Link to={`/organizations/${orgId}/edit/roles`} className="ml-auto">
          Roles &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

OrgEditPermissions.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPermissions;
