import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Button from '../../components/Button';
import TabLinks from '../../components/TabLinks';
import Select from 'react-select';

const UserEditSystemPermissions = ({ userId }) => {
  useDocumentTitle(`System permissions for user Justine Singh`);
  return (
    <React.Fragment>
      <h1 className="mb-6">&quot;USER_FULLNAME&quot;: System permissions</h1>
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
          {
            label: 'System permissions',
            to: `/users/${userId}/edit/system-permissions`,
          },
        ]}
      />
      <div className="bg-red-lightest rounded p-4 mb-6">
        <strong>Warning:</strong> Attaching any of the <code>yeep.***</code> system permissions to
        this user will grant them access to (parts of) this administration interface.
      </div>
      <p className="mb-2">Currently assigned system permissions:</p>
      <Select
        className="w-full mb-4"
        placeholder="Choose one or more system permissions"
        isMulti={true}
        options={[
          { value: 1, label: 'yeep.org.write' },
          { value: 2, label: 'yeep.org.read' },
          { value: 3, label: 'yeep.user.write' },
          { value: 4, label: 'yeep.user.read' },
          { value: 5, label: 'yeep.permission.write' },
          { value: 6, label: 'yeep.permission.read' },
        ]}
        isClearable={true}
      />
      <div className="sm:flex items-center">
        <Button className="w-full mb-2 sm:mb-0 sm:w-auto sm:mr-4">Save changes</Button>
        <span className="block text-center sm:text-left">
          {' '}
          or <Link to="/users">cancel and return to the list of users</Link>
        </span>
      </div>
    </React.Fragment>
  );
};

UserEditSystemPermissions.propTypes = {
  userId: PropTypes.string,
};

export default UserEditSystemPermissions;
