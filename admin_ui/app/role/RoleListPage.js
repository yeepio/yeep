import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Store from '../Store';
import ButtonLink from '../../components/ButtonLink';
import Select from 'react-select';
import Grid from '../../components/Grid';
import Input from '../../components/Input';
import RoleDeleteModal from './RoleDeleteModal';

// Dummy data
let roleHeadings = [
  { label: 'Role name', className: 'text-left' },
  { label: 'Permissions' },
  { label: 'System role?' },
  { label: 'Users' },
  { label: 'Org scope' },
  { label: 'Actions', isSortable: false },
];
let roleData = [
  {
    id: 1,
    name: 'admin',
    permissions: 10,
    systemRole: true,
    users: 1,
    orgScope: null,
  },
  {
    id: 2,
    name: 'blog_user',
    permissions: 1,
    systemRole: false,
    users: 10,
    orgScope: {
      orgId: 1,
      orgLabel: 'blog',
    },
  },
  {
    id: 3,
    name: 'blog_admin',
    permissions: 4,
    systemRole: false,
    users: 2,
    orgScope: {
      orgId: 1,
      orgLabel: 'blog',
    },
  },
  {
    id: 4,
    name: 'crm_user',
    permissions: 1,
    systemRole: false,
    users: 50,
    orgScope: {
      orgId: 2,
      orgLabel: 'zoho_crm',
    },
  },
  {
    id: 5,
    name: 'crm_admin',
    permissions: 5,
    systemRole: false,
    users: 2,
    orgScope: {
      orgId: 2,
      orgLabel: 'zoho_crm',
    },
  },
];

const RoleListPage = () => {
  useDocumentTitle('Roles');
  // Load the store (we need access to store.role.deleteModal$)
  const store = React.useContext(Store);
  return (
    <React.Fragment>
      <RoleDeleteModal />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="mb-6">Roles</h1>
      <fieldset className="mb-6">
        <legend>Filters and quick search</legend>
        <div className="sm:flex items-center">
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
          <label htmlFor="showSystemRoles" className="block flex-initial mb-3 sm:mb-0 sm:mr-3">
            <input type="checkbox" id="showSystemRoles" className="mr-2" />
            Show system roles
          </label>
          <Input placeholder="quicksearch" className="w-full sm:w-1/3" />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={roleHeadings}
        data={roleData}
        renderer={(roleData, index) => {
          return (
            <tr key={`roleRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${roleData.id}/edit`}>{roleData.name}</Link>
              </td>
              <td className="p-2 text-center">{roleData.permissions}</td>
              <td className="p-2 text-center">{roleData.systemRole ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{roleData.users}</td>
              <td className="p-2 text-center">
                {roleData.orgScope ? roleData.orgScope.orgLabel : '-'}
              </td>
              <td className="p-2 text-center">
                <Link to={`${roleData.id}/edit`}>Edit</Link>{' '}
                <button
                  onClick={() => store.role.deleteModal$.next('DELETE')}
                  className="pseudolink"
                >
                  Delete
                </button>
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

export default RoleListPage;
