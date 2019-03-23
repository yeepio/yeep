import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Grid from '../../components/Grid';

// Dummy data
let gridHeadings = [
  { label: 'Name', sort: 'asc', className: 'text-left' },
  { label: 'Slug / URL key' },
  { label: 'User count' },
  { label: 'Role count' },
  { label: 'Permission count' },
  { label: 'Actions', isSortable: false },
];
let gridData = [
  {
    orgId: 1,
    orgLabel: 'Our Tech Blog',
    slug: 'blog',
    users: 5,
    roles: 4,
    permissions: 10,
  },
  {
    orgId: 2,
    orgLabel: 'Zoho CRM',
    slug: 'zoho_crm',
    users: 40,
    roles: 5,
    permissions: 11,
  },
];

const OrgList = () => {
  useDocumentTitle('Organization List');
  return (
    <React.Fragment>
      <Button className="float-right">Create new</Button>
      <h1 className="mb-6">Organizations</h1>
      <fieldset className="mb-6">
        <legend>Quick search</legend>
        <Input id="quicksearch" placeholder="quicksearch" />
      </fieldset>
      <Grid
        className="mb-6"
        headings={gridHeadings}
        data={gridData}
        renderer={(rowData, index) => {
          return (
            <tr key={`gridRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <a href="/">{rowData.orgLabel}</a>
              </td>
              <td className="p-2 text-center">{rowData.slug}</td>
              <td className="p-2 text-center">
                <a href="/">{rowData.users}</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">{rowData.roles}</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">{rowData.permissions}</a>
              </td>
              <td className="p-2 text-center">
                <Link to={`${rowData.orgId}/edit`}>Edit</Link> <a href="/">Delete</a>
              </td>
            </tr>
          );
        }}
      />
      <p>
        <Link to="/organizations">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default OrgList;
