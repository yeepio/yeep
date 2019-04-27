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
  // For permissions use an object to help us quickly establish if a certain permission is present
  const [permissions, setPermissions] = React.useState({});

  const handleOrgChange = (org) => {
    if (org === null) {
      // User cleared the organization dropdown.
      // Let's clear everything else.
      setRoles([]);
      setOrganization(null);
      setPermissions({});
    } else {
      // Store the selected org to the store
      setOrganization(org);
    }
  };

  const handleRoleChange = (chosenRoles, { action, removedValue }) => {
    // Any role change will also affect the currently shown permissions
    // Let's create a cou[le
    let tempRoles = roles;
    let tempPermissions = permissions;
    // Act depending on the action
    if (action === 'clear') {
      // User pressed the "X" to clear all roles
      // First empty the roles array
      tempRoles = [];
      // Then remove any isFixed === 1 permissions
      tempPermissions = Object.values(tempPermissions)
        .filter((v) => !v.isFixed)
        .reduce((accummulator, currentValue) => {
          accummulator[currentValue.value] = currentValue;
          return accummulator;
        }, {});
    } else if (action === 'remove-value' || action === 'pop-value') {
      // Remove the role the user picked
      tempRoles = roles.filter((v) => v.value !== removedValue.value);
      // Remove any permissions from this role
      removedValue.permissions.map((permission) => {
        delete tempPermissions[permission.value];
      });
      // It is possible that we removed a permission that is needed by one of the
      // still-present roles. Iterate through the role(s) currently in state
      // and re-add their permissions.
      tempRoles.map((role) => {
        role.permissions.map((permission) => {
          tempPermissions[permission.value] = permission;
        });
      });
    } else {
      tempRoles = chosenRoles;
      // Let's add the permissions for each of the chosenRoles
      // These should be added with isFixed:1 (so that they are removed
      // only if the user removes the role that applied them)
      chosenRoles.map((chosenRole) => {
        chosenRole.permissions.map((permission) => {
          tempPermissions[permission.value] = permission;
        });
      });
    }
    // Update the state
    setRoles(tempRoles);
    setPermissions(tempPermissions);
  };

  const handlePermissionChange = (chosenPermissions, { action, removedValue }) => {
    // Clone the current permissions for ease of manipulation
    let temp = { ...permissions };
    switch (action) {
      case 'clear':
        // Clear all permissions _except_ the ones with isFixed === 1 (
        // i.e. the ones assigned by a role)
        setPermissions(
          Object.values(temp)
            .filter((v) => v.isFixed)
            .reduce((accummulator, currentValue) => {
              accummulator[currentValue.value] = currentValue;
              return accummulator;
            }, {})
        );
        break;
      case 'remove-value':
      case 'pop-value':
        // Remote the permission the user picked but only if not isFixed
        if (!removedValue.isFixed && permissions[removedValue.value]) {
          delete temp[removedValue.value];
          setPermissions(temp);
        }
        break;
      default:
        setPermissions(
          chosenPermissions.reduce((accumulator, currentValue) => {
            accumulator[currentValue.value] = currentValue;
            return accumulator;
          }, {})
        );
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
            value={Object.values(permissions)}
            options={dummyPermissions}
            isDisabled={organization === null}
            className="w-full sm:w-1/2"
            placeholder={
              organization === null ? 'Choose an organization first' : 'Choose permissions'
            }
            isMulti={true}
            //isClearable={permissions.some((v) => !v.isFixed)}
            styles={permissionPillboxStyles}
            onChange={handlePermissionChange}
          />
        </div>
        {!!Object.keys(permissions).length && (
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
