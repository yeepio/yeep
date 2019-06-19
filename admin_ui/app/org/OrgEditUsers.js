import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';
import Button from '../../components/Button';
import Grid from '../../components/Grid';

// Dummy data
let userHeadings = [
  { label: 'Username', className: 'text-left' },
  { label: 'Full name', className: 'text-left' },
  { label: 'Verified?' },
  { label: 'Primary email', className: 'text-left' },
  { label: 'Roles' },
  { label: 'Actions', isSortable: false, className: 'text-right' },
];
let userData = [
  {
    id: 1,
    username: 'rf123',
    fullName: 'Rodney Fields',
    verified: true,
    email: 'rodney@gmail.com',
    roles: 1,
  },
  {
    id: 2,
    username: 'manuela1091',
    fullName: 'Manuela Carvalho',
    verified: true,
    email: 'mcarvallho45@hotmail.com',
    roles: 2,
  },
  {
    id: 3,
    username: 'pmartin_5',
    fullName: 'Philip Martin',
    verified: false,
    email: 'mcarvallho45@hotmail.com',
    roles: 2,
  },
  {
    id: 4,
    username: 'leeleeva',
    fullName: 'Liva Christensen',
    verified: false,
    email: 'leeleeva@gmail.com',
    roles: 1,
  },
];

const OrgEditUsers = ({ orgId }) => {
  useDocumentTitle(`Organization name: User memberships`);
  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">&quot;Organization name&quot;: User memberships</h1>
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
        <legend>User actions</legend>
        <div className="sm:flex mb-4 items-center">
          <Button className="w-full sm:w-48 sm:mr-4 flex-none">Invite user</Button>
          <p>
            Send an invite link to an email address. Invitees can follow the link to create their
            profile
          </p>
        </div>
        <div className="sm:flex items-center">
          <Button className="w-full sm:w-48 sm:mr-4 flex-none">Create new user</Button>
          <p>Create a new user account by manually entering all the details</p>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Pending invitations</legend>
        <p>
          There is currently <strong>1</strong> pending invitation to the &quot;ORGNAME&quot;
          organization:
        </p>
        <Grid
          headings={[
            {
              label: 'Email address',
              className: 'text-left',
            },
            {
              label: 'Invitation sent on',
            },
            {
              label: 'Actions',
              isSortable: false,
              className: 'text-right',
            },
          ]}
          data={[
            {
              email: 'achaidas@gmail.com',
              invitationSent: '3rd of January 2019 - 10:39',
            },
          ]}
          renderer={(invitationData, index) => {
            return (
              <tr key={`invitationRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
                <td className="p-2 text-left">{invitationData.email}</td>
                <td className="p-2">{invitationData.invitationSent}</td>
                <td className="p-2 text-right">
                  <button className="pseudolink">Resend invitation</button>
                  {' - '}
                  <button className="pseudolink">Cancel invitation</button>
                </td>
              </tr>
            );
          }}
        />
      </fieldset>
      <fieldset className="mb-6">
        <legend>Existing users</legend>
        <Grid
          headings={userHeadings}
          data={userData}
          renderer={(userData, index) => {
            return (
              <tr key={`userRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
                <td className="p-2">{userData.username}</td>
                <td className="p-2">
                  <Link to={`${userData.id}/edit`}>{userData.fullName}</Link>
                </td>
                <td className="p-2 text-center">
                  {userData.verified && <img src="/icon-yes.svg" alt="Verified email" width={16} />}
                  {!userData.verified && <img src="/icon-no.svg" alt="Non-verified email" width={16} />}
                </td>
                <td className="p-2">{userData.email}</td>
                <td className="p-2 text-center">{userData.roles}</td>
                <td className="p-2 text-right">
                  <Link to={`${userData.id}/edit`}>Edit</Link> <a href="/">Delete</a>
                </td>
              </tr>
            );
          }}
        />
      </fieldset>
      <p className="flex">
        <Link to={`/organizations/${orgId}/edit/roles`}>&laquo; Roles</Link>
      </p>
    </React.Fragment>
  );
};

OrgEditUsers.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditUsers;
