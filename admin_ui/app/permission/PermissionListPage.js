import React, { useCallback } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import Select from 'react-select';
import Grid from '../../components/Grid';
import Input from '../../components/Input';
import PermissionDeleteModal from '../modals/PermissionDeleteModal';
import { openPermissionDeleteModal } from '../modals/permissionModalsStore';

// Dummy data
let permissionHeadings = [
  {
    label: 'Name',
    className: 'text-left',
  },
  { label: 'Is system?' },
  { label: 'Role assignments' },
  { label: 'Org scope' },
  { label: 'Actions', isSortable: false },
];
let permissionData = [
  {
    id: 1,
    name: 'yeep.org.write',
    systemPermission: true,
    roles: 1,
    orgScope: null,
  },
  {
    id: 2,
    name: 'yeep.org.read',
    systemPermission: true,
    roles: 1,
    orgScope: null,
  },
  {
    id: 3,
    name: 'yeep.user.write',
    systemPermission: true,
    roles: 1,
    orgScope: null,
  },
  {
    id: 4,
    name: 'yeep.user.read',
    systemPermission: true,
    roles: 1,
    orgScope: null,
  },
  {
    id: 5,
    name: 'yeep.permission.write',
    systemPermission: true,
    roles: 1,
    orgScope: null,
  },
  {
    id: 6,
    name: 'yeep.permission.read',
    systemPermission: true,
    roles: 1,
    orgScope: null,
  },
  {
    id: 7,
    name: 'blog.read',
    systemPermission: false,
    roles: 1,
    orgScope: {
      ordId: 1,
      orgLabel: 'blog',
    },
  },
  {
    id: 8,
    name: 'blog.modify',
    systemPermission: false,
    roles: 1,
    orgScope: {
      ordId: 1,
      orgLabel: 'blog',
    },
  },
];

const PermissionListPage = () => {
  useDocumentTitle('Permissions');

  const dispatch = useDispatch();
  const handleDelete = useCallback(() => {
    dispatch(
      openPermissionDeleteModal(
        {
          id: 1,
          name: 'blog.read',
        },
        () => {
          console.log('Submit from permissionDelete modal!');
        },
        () => {
          console.log('Cancel from permissionDelete modal');
        }
      )
    );
  }, [dispatch]);

  return (
    <React.Fragment>
      <PermissionDeleteModal />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Permissions</h1>
      <fieldset className="mb-6">
        <legend>Filters and quick search</legend>
        <div className="sm:flex items-center">
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All roles"
            options={[
              { value: 1, label: 'Role 1' },
              { value: 2, label: 'Role 2' },
              { value: 3, label: 'Role 3' },
              { value: 4, label: 'Role 4' },
            ]}
            isClearable={true}
          />
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All organisations"
            options={[
              { value: 1, label: 'Org 1' },
              { value: 2, label: 'Org 2' },
              { value: 3, label: 'Org 3' },
              { value: 4, label: 'Org 4' },
            ]}
            isClearable={true}
          />
          <label
            htmlFor="showSystemPermissions"
            className="block flex-initial mb-3 sm:mb-0 sm:mr-3"
          >
            <input type="checkbox" id="showSystemPermissions" className="mr-2" />
            Show system permissions
          </label>
          <Input placeholder="quicksearch" className="w-full sm:w-1/4" />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={permissionHeadings}
        data={permissionData}
        renderer={(permissionData, index) => {
          return (
            <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${permissionData.id}/edit`}>{permissionData.name}</Link>
              </td>
              <td className="p-2 text-center">{permissionData.systemPermission ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{permissionData.roles}</td>
              <td className="p-2 text-center">
                {permissionData.orgScope ? permissionData.orgScope.orgLabel : '-'}
              </td>
              <td className="p-2 text-center">
                {permissionData.orgScope && (
                  <React.Fragment>
                    <Link to={`${permissionData.id}/edit`}>Edit</Link>{' '}
                    <button onClick={handleDelete} className="pseudolink">
                      Delete
                    </button>
                  </React.Fragment>
                )}
                {!permissionData.orgScope && <span className="text-grey">Cannot modify</span>}
              </td>
            </tr>
          );
        }}
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default PermissionListPage;
