import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Button from '../../components/Button';
import TabLinks from '../../components/TabLinks';

const OrgEditPage = ({ orgId }) => {
  useDocumentTitle(`Edit organization #${orgId}`);
  return (
    <React.Fragment>
      <h1 className="mb-6">Edit organization #{orgId}</h1>
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
        <legend>Organisation details</legend>
        <div className="form-group mb-4">
          <label htmlFor="org-name">Name:</label>
          <Input id="org-name" placeholder="organisation name" className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="org-slug">Slug:</label>
          <Input id="org-slug" placeholder="url slug" className="w-full sm:w-1/2" />
        </div>
        <div className="form-submit">
          <Button>Save changes</Button>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Danger zone</legend>
        <Button danger={true}>Delete organization</Button>
      </fieldset>
      <p className="flex">
        <Link to="/organizations">Return to the list of organizations</Link>
        <Link to={`/organizations/${orgId}/edit/permissions`} className="ml-auto">Permissions &raquo;</Link>
      </p>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
