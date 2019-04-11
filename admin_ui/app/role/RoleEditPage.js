import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import { useObservable } from 'rxjs-hooks';
import useDocumentTitle from '@rehooks/document-title';
import Store from '../Store';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Button from '../../components/Button';
import Select from 'react-select';
import RoleDeleteModal from './RoleDeleteModal';

const RoleEditPage = ({ roleId }) => {
  useDocumentTitle(`Edit role#${roleId}`);
  // Load the store
  const store = React.useContext(Store);
  // Establish the values for the changedPermissions$ and changedOrg$ flags
  // (we'll use to decide whether to show "Save changes" buttons in the appropriate sections)
  const changedPermissions = useObservable(
    () => store.role.changedPermissions$,
    store.role.changedPermissions$.getValue()
  );
  const changedOrg = useObservable(() => store.role.changedOrg$, store.role.changedOrg$.getValue());
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
        <div className="form-submit">
          <Button className="w-full sm:w-auto sm:mr-4">Save changes</Button>
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
            onChange={() => {
              // Set the changedOrg$ flag to "true" to indicate that the user
              // has made some changes to this section
              store.role.changedOrg$.next(true);
            }}
          />
          <div className="neutral mb-4">
            Scoping to an organisation ensures:
            <br />
            <ul>
              <li>
                This role can only be assigned to users that are also assigned to that organization
              </li>
              <li>You can only associate permissions that are also scoped to that organization</li>
            </ul>
          </div>
          {changedOrg && (
            <div className="form-submit">
              <Button className="w-full sm:w-auto sm:mr-4">Save changes</Button>
            </div>
          )}
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
          onChange={() => {
            // Set the changedOrg$ flag to "true" to indicate that the user
            // has made some changes to the permnissions for this role
            store.role.changedPermissions$.next(true);
          }}
        />
        {changedPermissions && <Button className="w-full sm:w-auto">Save changes</Button>}
      </fieldset>
      <fieldset className="mb-6">
        <legend>Danger zone</legend>
        <Button danger={true} onClick={() => store.role.deleteModal$.next('DELETE')}>
          Delete role
        </Button>
      </fieldset>
      <p>
        <Link to="/roles">Return to the list of roles</Link>
      </p>
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
