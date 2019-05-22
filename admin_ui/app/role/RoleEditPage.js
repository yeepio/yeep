import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Store from '../Store';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import Select from 'react-select';
import RoleDeleteModal from './RoleDeleteModal';

const RoleEditPage = ({ roleId }) => {
  useDocumentTitle(`Edit role#${roleId}`);

  // Load the store (we need access to store.role.deleteModal$)
  const store = React.useContext(Store);

  // On componentDidUnmount close any open modals!
  React.useEffect(() => {
    return () => {
      store.role.deleteModal$.next('');
    };
  });

  return (
    <React.Fragment>
      <RoleDeleteModal />
      <h1 className="mb-6">Edit role #{roleId}</h1>
      <fieldset className="mb-6">
        <legend>Role details</legend>
        <div className="form-group mb-4">
          <label htmlFor="role-name">Name:</label>
          <Input id="role-name" placeholder='e.g. "blog_admin"' className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="role-description">Description:</label>
          <Textarea
            id="role-description"
            placeholder="Enter a description for this role"
            className="w-full sm:w-1/2"
            rows="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role-org">Organization scope:</label>
          <Input disabled id="role-org" value="Our Tech Blog" className="w-full sm:w-1/2" />
          <div className="neutral">
            Once created a role <strong>cannot</strong> change the organization it belongs to.
            Please create a new role if you need to.
          </div>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Permissions</legend>
        <p className="mb-4">Pick one or more permissions to associate with this role:</p>
        <Select
          isMulti
          className="w-full mb-4"
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
      <fieldset className="mb-6">
        <legend>Danger zone</legend>
        <Button danger={true} onClick={() => store.role.deleteModal$.next('DELETE')}>
          Delete role
        </Button>
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

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
