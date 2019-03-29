import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Button from '../../components/Button';

const OrgCreate = () => {
  useDocumentTitle('Create new organization');
  return (
    <React.Fragment>
      <h1 className="mb-6">Create new organization</h1>
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
      <p>
        Return to the <Link to="/organizations">list of organizations</Link>
      </p>
    </React.Fragment>
  );
};

export default OrgCreate;
