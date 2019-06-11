import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import Select from 'react-select';

const PermissionEditPage = ({ permissionId }) => {
  useDocumentTitle(`Edit permission #${permissionId}`);
  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Edit permission #{permissionId}</h1>
      <fieldset className="mb-6">
        <legend>Permission fields</legend>
        <div className="form-group mb-4">
          <label htmlFor="permission-name">Name:</label>
          <Input id="permission-name" placeholder='e.g. "blog.read"' className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="permission-description">Description:</label>
          <Textarea
            id="permission-description"
            placeholder="Enter a description for this permission"
            className="w-full sm:w-1/2"
            rows="6"
          />
        </div>
        <div className="form-submit">
          <Button className="w-full mb-2 sm:mb-0 sm:w-auto sm:mr-4">Save changes</Button>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Scope</legend>
        <div className="form-group">
          <label htmlFor="permission-org-scope">Organization:</label>
          <Select
            className="w-full sm:w-1/2"
            placeholder="Choose an organization (optional)"
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
          />
          <div className="neutral">
            Scoping to an organisation ensures that this permission can only be assigned users (and
            roles) that are also scoped to that organization.
          </div>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Danger zone</legend>
        <Button danger={true}>Delete permission</Button>
      </fieldset>
      <p>
        <Link to="/permissions">Return to the list of permissions</Link>
      </p>
    </React.Fragment>
  );
};

PermissionEditPage.propTypes = {
  permissionId: PropTypes.string,
};

export default PermissionEditPage;
