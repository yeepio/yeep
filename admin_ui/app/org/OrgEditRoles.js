import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import { useDispatch } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';
import Button from '../../components/Button';
import Grid from '../../components/Grid';
import RoleCreateModal from '../modals/RoleCreateModal';
import RoleEditModal from '../modals/RoleEditModal';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import {
  openRoleCreateModal,
  openRoleEditModal,
  openRoleDeleteModal,
} from '../modals/roleModalsStore';

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
  const dispatch = useDispatch();

  // Set page title
  useDocumentTitle(`Organization name: Roles`);

  return (
    <React.Fragment>
      <RoleCreateModal/>
      <RoleEditModal/>
      <RoleDeleteModal/>
      <h1 className="font-semibold text-3xl mb-6">&quot;Organization name&quot;: Roles</h1>
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
            dispatch(openRoleCreateModal());
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
                <td className="p-2">{role.name}</td>
                <td className="p-2 text-center">{role.permissionCount}</td>
                <td className="p-2 text-center">{role.userCount}</td>
                <td className="p-2 text-right">
                  <button
                    className="pseudolink"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(
                        openRoleEditModal(
                          role,
                          () => {
                            console.log('Submit from roleEdit modal');
                          },
                          () => {
                            console.log('Cancel from roleEdit modal');
                          }
                        )
                      );
                    }}
                  >
                    Edit
                  </button>{' '}
                  <button
                    className="pseudolink"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(
                        openRoleDeleteModal(
                          role,
                          () => {
                            console.log('Submit from roleDelete modal');
                          },
                          () => {
                            console.log('Cancel from roleDelete modal');
                          }
                        )
                      );
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
