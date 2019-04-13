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

const UserEditMemberships = ({ userId }) => {
  // Store the list of all roles for the selected org
  const [roles, setRoles] = React.useState([]);

  const handleOrgChange = org => {
    if (org === null) {
      // User opted to clear the "organization" Select
      // Reset the roles to be an empty array
      setRoles([]);
      console.log('org is null, roles should be null: ', roles);
    } else {
      // We'll replace this with an API call. For now just populate with dummy roles
      setRoles([
        {
          id: 1,
          name: 'role_1',
        },
        {
          id: 2,
          name: 'role_2',
        },
        {
          id: 3,
          name: 'role_3',
        },
        {
          id: 4,
          name: 'role_4',
        },
      ]);
      console.log('org is not null, org should have 4 values:', roles);
    }
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
            isDisabled={true}
            className="w-full sm:w-1/2"
            placeholder="Choose an organisation first"
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="membership-permissions">Permissions:</label>
          <Select
            isDisabled={true}
            className="w-full sm:w-1/2"
            placeholder="Choose an organisation first"
          />
        </div>
        <div className="form-submit">
          <Button className="w-full sm:w-auto">Save changes</Button>
        </div>
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
