import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import noop from 'lodash/noop';
import Input from './Input';
import Textarea from './Textarea';
import yeepClient from '../app/yeepClient';
import Button from './Button';

function fetchScopeOptionsAsync(inputValue) {
  return yeepClient.api().then((api) => {
    return api.org
      .list({
        q: inputValue || undefined,
        limit: 10,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchScopeOptionsAsync),
      })
      .then((data) =>
        data.orgs.map((org) => {
          return {
            label: org.name,
            value: org.id,
          };
        })
      );
  });
}

function fetchPermissionOptionsAsync(inputValue) {
  return yeepClient.api().then((api) => {
    return api.permission
      .list({
        q: inputValue || undefined,
        limit: 10,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchPermissionOptionsAsync),
      })
      .then((data) =>
        data.permissions.map((permission) => {
          return {
            label: permission.name,
            value: permission.id,
          };
        })
      );
  });
}

const RoleForm = ({ onSubmit, onCancel, defaultValues }) => {
  const [name, setName] = useState(defaultValues.name || '');
  const [description, setDescription] = useState(defaultValues.description || '');
  const [scope, setScope] = useState(defaultValues.scope || '');
  const [permissions, setPermissions] = useState(defaultValues.permissions || []);

  const onChangeName = useCallback(
    (event) => {
      setName(event.target.value);
    },
    [setName]
  );

  const onChangeDescription = useCallback(
    (event) => {
      setDescription(event.target.value);
    },
    [setDescription]
  );

  const onFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      onSubmit({
        name,
        description,
        scope,
        permissions,
      });
    },
    [onSubmit, name, description, scope, permissions]
  );

  return (
    <form onSubmit={onFormSubmit}>
      <div className="my-4 flex">
        <div className="flex items-center w-1/4 h-10 flex-shrink-0 pr-4">
          <label htmlFor="name" className="">
            Name
          </label>
        </div>
        <div className="flex-grow">
          <Input id="name" className="w-full" value={name} onChange={onChangeName} />
        </div>
      </div>
      <div className="my-4 flex">
        <div className="flex items-center w-1/4 h-10 flex-shrink-0 pr-4">
          <label htmlFor="description" className="">
            Description (optional)
          </label>
        </div>
        <div className="flex-grow">
          <Textarea
            id="description"
            className="w-full"
            rows="3"
            value={description}
            onChange={onChangeDescription}
          />
        </div>
      </div>
      <div className="my-4 flex">
        <div className="flex items-center w-1/4 h-10 flex-shrink-0 pr-4">
          <label htmlFor="scope" className="">
            Organization scope (optional)
          </label>
        </div>
        <div className="flex-grow">
          <AsyncSelect
            id="scope"
            className="w-full"
            placeholder="Choose an organization"
            loadOptions={fetchScopeOptionsAsync}
            isClearable={true}
            defaultOptions={true}
            value={scope}
            onChange={setScope}
          />
        </div>
      </div>
      <div className="my-4 flex">
        <div className="flex items-center w-1/4 h-10 flex-shrink-0 pr-4">
          <label htmlFor="permissions" className="">
            Permissions
          </label>
        </div>
        <div className="flex-grow">
          <AsyncSelect
            id="permissions"
            className="w-full"
            placeholder="Add role permissions"
            loadOptions={fetchPermissionOptionsAsync}
            isMulti={true}
            isClearable={true}
            defaultOptions={true}
            value={permissions}
            onChange={setPermissions}
          />
        </div>
      </div>
      <div className="my-4 flex">
        <div className="w-1/4 flex-shrink-0">&nbsp;</div>
        <div className="flex items-center">
          <Button type="submit">Save</Button>
          <button type="button" className="p-0 ml-4" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

RoleForm.propTypes = {
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  defaultValues: PropTypes.object,
};

RoleForm.defaultProps = {
  onSubmit: noop,
  onCancel: noop,
  defaultValues: {},
};

export default RoleForm;
