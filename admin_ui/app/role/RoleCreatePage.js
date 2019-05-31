import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import Select from 'react-select';

const RoleCreatePage = () => {
  useDocumentTitle('Create role');
  return (
    <React.Fragment>
      <h1 className="mb-6">Create new role</h1>
      <fieldset className="mb-6">
        <legend>Role details</legend>
        <div className="form-group mb-4">
          <label htmlFor="role-name">Name:</label>
          <Input id="role-name" placeholder='e.g. "blog_admin"' className="w-full sm:w-1/2" />
        </div>
        <div className="form-group">
          <label htmlFor="role-description">Description:</label>
          <Textarea
            id="role-description"
            placeholder="Enter a description for this role"
            className="w-full sm:w-1/2"
            rows="6"
          />
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Scope</legend>
        <div className="form-group">
          <label htmlFor="role-org-scope">Organization:</label>
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
            Scoping to an organisation ensures:
            <br />
            <ul>
              <li>
                This role can only be assigned to users that are also assigned to that
                organization
              </li>
              <li>
                You can only associate permissions that are also scoped to that organization
              </li>
            </ul>
          </div>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Permissions</legend>
        <p className="mb-4">Please choose one or more permissions to associate with this role:</p>
        <Select
          isMulti
          className="w-full"
          placeholder="Choose one or more permissions"
          options={[
            { value: 1, label: 'blog.read' },
            { value: 2, label: 'blog.write' },
            { value: 3, label: 'yeep.org.write' },
            { value: 4, label: 'yeep.org.read' },
            { value: 5, label: 'yeep.users.read' },
            { value: 6, label: 'yeep.users.write' },
            { value: 7, label: 'yeep.someperm.1' },
            { value: 8, label: 'yeep.someperm.2' },
            { value: 9, label: 'yeep.someperm.2' },
            { value: 10, label: 'crm.access.1', isDisabled: true },
            { value: 11, label: 'crm.access.2', isDisabled: true },
            { value: 12, label: 'crm.access.3', isDisabled: true },
          ]}
          defaultValue={[{ value: 1, label: 'blog.read' }, { value: 2, label: 'blog.write' }]}
        />
      </fieldset>
      <div className="sm:flex items-center">
        <Button className="w-full mb-2 sm:mb-0 sm:w-auto sm:mr-4">Save changes</Button>
        <span className="block text-center sm:text-left">
          {' '}
          or <Link to="/roles">cancel and return to the list of roles</Link>
        </span>
      </div>
    </React.Fragment>
  );
};

export default RoleCreatePage;
