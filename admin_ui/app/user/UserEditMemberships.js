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

// Dummy org data
let dummyOrgs = [
  { value: 1, label: 'Organization #1' },
  { value: 2, label: 'Organization #2' },
  { value: 3, label: 'Organization #3' },
  {
    value: 4,
    label:
      'How does it look if the org name is so big that it span more than one line in the interface?',
  },
  { value: 5, label: 'Organization #5' },
];

// Dummy role and permission data just for the react-select proof of concept
let dummyRoles = [
  {
    value: 'blog_reader',
    label: 'blog_reader',
    permissions: [
      {
        value: 'blog.read',
        label: 'blog.read',
        isFixed: 1,
      },
    ],
  },
  {
    value: 'blog_editor',
    label: 'blog_editor',
    permissions: [
      {
        value: 'blog.read',
        label: 'blog.read',
        isFixed: 1,
      },
      {
        value: 'blog.edit',
        label: 'blog.edit',
        isFixed: 1,
      },
    ],
  },
  {
    value: 'blog_admin',
    label: 'blog_admin',
    permissions: [
      {
        value: 'blog.read',
        label: 'blog.read',
        isFixed: 1,
      },
      {
        value: 'blog.edit',
        label: 'blog.edit',
        isFixed: 1,
      },
      {
        value: 'blog.delete',
        label: 'blog.delete',
        isFixed: 1,
      },
      {
        value: 'blog.admin',
        label: 'blog.admin',
        isFixed: 1,
      },
    ],
  },
];
let dummyPermissions = [
  {
    value: 'yeep.admin',
    label: 'yeep.admin',
  },
  {
    value: 'yeep.write',
    label: 'yeep.write',
  },
  {
    value: 'yeep.read',
    label: 'yeep.read',
  },
  {
    value: 'blog.read',
    label: 'blog.read',
  },
  {
    value: 'blog.edit',
    label: 'blog.edit',
  },
  {
    value: 'blog.delete',
    label: 'blog.delete',
  },
  {
    value: 'blog.admin',
    label: 'blog.admin',
  },
];

const UserEditMemberships = ({ userId }) => {
  // Keep the currently selected org, role(s) and
  // permission(s) to the local state of this component
  const [organization, setOrganization] = React.useState(null);
  const [roles, setRoles] = React.useState([]);
  const [permissions, setPermissions] = React.useState([]);

  /**
   * Loads the roles for the currently selected org
   * @param org - The currently selected organization
   */
  const handleOrgChange = (org) => {
    console.log(org);
    if (org === null) {
      // User opted to clear the "organization" Select
      // org and role dropdowns should clear completely
      setRoles([]);
      setOrganization(null);
      // We should remove all "isFixed" permissions (which have
      // been added from a handleRoleChange call)
      setPermissions(permissions.filter((v) => v.isFixed));
    } else {
      // Store the selected org to the store
      setOrganization(org);
    }
  };

  const handleRoleChange = (chosenRoles, { action, removedValue }) => {
    switch (action) {
      case 'clear':
        // Clear all roles
        setRoles([]);
        break;
      case 'remove-value':
      case 'pop-value':
        // Remove the role the user picked
        setRoles(roles.filter((v) => v.value !== removedValue.value));
        // TODO: Remove this roles' permissions
        break;
      default:
        setRoles(chosenRoles);
        // TODO: add this roles' permissions as fixed
        break;
    }
  };

  const handlePermissionChange = (chosenPermissions, { action, removedValue }) => {
    console.log(chosenPermissions, action, removedValue);
    switch (action) {
      case 'clear':
        // Clear all permissions _except_ the ones assigned by a role
        setPermissions(permissions.filter((v) => v.isFixed));
        break;
      case 'remove-value':
      case 'pop-value':
        // Remote the permission the user picked but only if not isFixed
        if (!removedValue.isFixed) {
          setPermissions(permissions.filter((v) => v.value !== removedValue.value));
        }
        break;
      default:
        setPermissions(chosenPermissions);
        break;
    }
  };

  // Config object passed to the "styles" property of the permissions Select component
  // that ensures the "X" button is not shown for permissions that have the isFixed === 1 flag
  const permissionPillboxStyles = {
    multiValue: (base, state) => {
      return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
    },
    multiValueLabel: (base, state) => {
      return state.data.isFixed
        ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
        : base;
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
            options={dummyOrgs}
            isClearable={true}
            value={organization}
            onChange={handleOrgChange}
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="membership-roles">Roles:</label>
          <Select
            value={roles}
            options={dummyRoles}
            isDisabled={organization === null}
            className="w-full sm:w-1/2"
            placeholder={
              organization === null ? 'Choose an organisation first' : 'Choose one or more roles'
            }
            isMulti={true}
            onChange={handleRoleChange}
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="membership-permissions">Permissions:</label>
          <Select
            value={permissions}
            options={dummyPermissions}
            isDisabled={organization === null}
            className="w-full sm:w-1/2"
            placeholder={
              organization === null ? 'Choose an organization first' : 'Choose permissions'
            }
            isMulti={true}
            isClearable={permissions.some((v) => !v.isFixed)}
            styles={permissionPillboxStyles}
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
