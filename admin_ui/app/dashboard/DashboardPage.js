import React from 'react';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';
import { Link } from '@reach/router';
import IconOrganisation from '../../icons/IconOrganisation';

// TODO: Fetch actual data and replace this
const dummyOrgs = [
  {
    id: 1,
    name: 'Our Tech Blog',
    users: 10,
    activeSessions: 0,
    roles: 2,
  },
  {
    id: 2,
    name: 'Zoho CRM',
    users: 30,
    activeSessions: 1,
    roles: 7,
  },
];

const DashboardOrgCard = (props) => {
  return (
    <div className="border border-grey rounded p-4 flex-1 mb-4 sm:mr-4 relative">
      <h2 className="mb-4">
        <Link to={`/organizations/${props.id}/edit`}>{props.name}</Link>
      </h2>
      <IconOrganisation className="absolute pin-t pin-r mt-4 mr-4" height={28} />
      <table className="w-full">
        <tbody>
          <tr>
            <td>Total users:</td>
            <td className="text-right">
              <Link to="/users">{props.users}</Link>
            </td>
          </tr>
          <tr>
            <td>Active sessions:</td>
            <td className="text-right">{props.activeSessions}</td>
          </tr>
          <tr>
            <td>Org-specific roles:</td>
            <td className="text-right">
              <Link to="/roles">{props.roles}</Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
DashboardOrgCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  users: PropTypes.number,
  activeSessions: PropTypes.number,
  roles: PropTypes.number,
};

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  return (
    <div className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <h1 className="mb-4">Dashboard</h1>
      <p className="mb-4">
        Welcome <strong>Jane Doe</strong>. You are managing <strong>40</strong> users across{' '}
        <strong>2</strong> organisations:
      </p>
      <div className="sm:flex">
        <DashboardOrgCard {...dummyOrgs[0]} />
        <DashboardOrgCard {...dummyOrgs[1]} />
      </div>
      <div className="bg-yellow-lighter rounded p-4">
        <strong>Tip:</strong> Visit the <Link to="/sessions">Sessions</Link> page to see all the
        currently active users across your oganisations
      </div>
    </div>
  );
};

export default DashboardPage;
