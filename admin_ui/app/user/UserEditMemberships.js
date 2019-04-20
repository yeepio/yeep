import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Button from '../../components/Button';
import TabLinks from '../../components/TabLinks';
import Grid from '../../components/Grid';
import Select from 'react-select';

// Dummy data
let gridHeadings = [
  { label: 'Organization name', sort: 'asc', className: 'text-left' },
  { label: 'Slug / URL key' },
  { label: 'Role(s) in org' },
  { label: 'Actions', isSortable: false },
];
let gridData = [
  {
    orgId: 1,
    orgLabel: 'Our Tech Blog',
    slug: 'blog',
    roles: ['blog_admin', 'blog_user'],
  },
  {
    orgId: 2,
    orgLabel: 'Zoho CRM',
    slug: 'zoho_crm',
    roles: ['crm_user'],
  },
];

// Dummy role and permission data just for the react-select proof of concept
let dummyRoles = [
  {
    value: 1,
    label: 'blog_reader',
  },
  {
    value: 2,
    label: 'blog_editor',
  },
  {
    value: 3,
    label: 'blog_admin',
  },
];
let dummyPermissions = {
  blog_reader: [
    {
      value: 1,
      label: 'blog.read',
      isFixed: 1,
    },
  ],
  blog_editor: [
    {
      value: 1,
      label: 'blog.read',
      isFixed: 1,
    },
    {
      value: 2,
      label: 'blog.edit',
      isFixed: 1,
    },
  ],
  blog_admin: [
    {
      value: 1,
      label: 'blog.read',
      isFixed: 1,
    },
    {
      value: 2,
      label: 'blog.edit',
      isFixed: 1,
    },
    {
      value: 3,
      label: 'blog.delete',
      isFixed: 1,
    },
    {
      value: 4,
      label: 'blog.admin',
      isFixed: 1,
    },
  ],
};

const UserEditMemberships = ({ userId }) => {
  // Store the list of all roles for the selected org
  const [roles, setRoles] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);

  /**
   * Loads the roles for the currently selected org
   * @param org - The currently selected organization
   */
  const handleOrgChange = (org) => {
    if (org === null) {
      // User opted to clear the "organization" Select
      // Reset the roles to be an empty array
      setRoles([]);
      setPermissions([]);
    } else {
      // We'll replace this with an API call. For now just populate with dummy roles
      setRoles(dummyRoles);
    }
  };

  /**
   * Loads appropriate permissions for the currently selected role(s)
   * @param role - An array of currently selected roles returned from the Select component
   */
  const handleRoleChange = (role) => {
    if (role.length === 0) {
      // User opted to clear the "permissions" Select
      // Clear the roles as well!
      setPermissions([]);
    } else {
      // Uber hacky - just for the proof of concept
      setPermissions(dummyPermissions[role.slice(-1)[0].label]);
    }
  };

  const handlePermissionChange = (permissions, {action, removedValue}) => {
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        }
        break;
      case 'clear':
        permissions = permissions.filter((v) => v.isFixed);
        break;
    }
    setPermissions(permissions);
  };

  // Config object passed to the "styles" property of the permissions Select component
  // that ensures the "X" button is not shown for permissions that have the isFixed === 1 flag
  const permissionPillboxStyles = {
    multiValue: (base, state) => {
      return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
    },
    multiValueLabel: (base, state) => {
      return state.data.isFixed ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 } : base;
    },
    multiValueRemove: (base, state) => {
      return state.data.isFixed ? { ...base, display: 'none' } : base;
    },
  };

  useDocumentTitle(`Organization memberships for user Justine Singh`);
  return (
    <React.Fragment>
      <h1 className="mb-6">&quot;Justine Singh&quot;: Organization memberships</h1>
      <TabLinks
        className="mb-6"
        links={[
          {
            label: 'User details',
            to: `/users/${userId}/edit`,
          },
          {
            label: 'Organization membership',
            to: `/users/${userId}/edit/memberships`,
          },
        ]}
      />
      <fieldset className="mb-6">
        <legend>Create new membership</legend>
        <div className="form-group mb-4">
          <label htmlFor="role-org-scope">Organization:</label>
          <Select
            className="w-full sm:w-1/2"
            placeholder="Choose an organization"
            options={[
              { value: 1, label: 'Organization #1' },
              { value: 2, label: 'Organization #2' },
              { value: 3, label: 'Organization #3' },
              { value: 4, label: 'Organization #4' },
              { value: 5, label: 'Organization #5 with a much longer name than usual' },
              { value: 6, label: 'Organization #6' },
              { value: 7, label: 'Organization #7' },
              { value: 8, label: 'Organization #8' },
            ]}
            isClearable={true}
            onChange={handleOrgChange}
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="membership-roles">Roles:</label>
          <Select
            options={roles}
            isDisabled={!roles.length}
            className="w-full sm:w-1/2"
            placeholder={roles.length ? 'Choose one or more roles' : 'Choose an organisation first'}
            isMulti={true}
            onChange={handleRoleChange}
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="membership-permissions">Permissions:</label>
          <Select
            value={permissions}
            isDisabled={!permissions.length}
            className="w-full sm:w-1/2"
            placeholder="Choose a role first"
            isMulti={true}
            isClearable={permissions.some(v => !v.isFixed)}
            styles={permissionPillboxStyles}
            options={[
              { value: 10, label: 'yeep.perm.1' },
              { value: 11, label: 'yeep.perm.2' },
              { value: 12, label: 'yeep.perm.3' },
            ]}
            onChange={handlePermissionChange}
          />
        </div>
        {!!permissions.length && (
          <div className="form-submit">
            <Button className="w-full sm:w-auto">Save changes</Button>
          </div>
        )}
      </fieldset>
      <fieldset className="mb-6">
        <legend>Current memberships</legend>
        <p className="mb-4">This user has roles in the following organizations:</p>
        <Grid
          headings={gridHeadings}
          data={gridData}
          renderer={(rowData, index) => {
            return (
              <tr key={`gridRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
                <td className="p-2">
                  <Link to={`${rowData.orgId}/edit`}>{rowData.orgLabel}</Link>
                </td>
                <td className="p-2 text-center">{rowData.slug}</td>
                <td className="p-2 text-center">
                  {rowData.roles.map((role) => (
                    <button key={`role_${role}`} className="pseudolink mr-3">
                      {role}
                    </button>
                  ))}
                </td>
                <td className="p-2 text-center">
                  <Link to={`${rowData.orgId}/edit`}>Edit</Link> <a href="/">Delete</a>
                </td>
              </tr>
            );
          }}
        />
      </fieldset>
      <div>
        <Link to="/users">Return to the list of users</Link>
      </div>
    </React.Fragment>
  );
};

UserEditMemberships.propTypes = {
  userId: PropTypes.string,
};

export default UserEditMemberships;
