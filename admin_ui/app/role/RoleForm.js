import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import noop from 'lodash/noop';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import yeepClient from '../yeepClient';
import Button from '../../components/Button';
import OrgOption from '../../utilities/OrgOption';
import PermissionOption from '../../utilities/PermissionOption';

function fetchOrgOptionsAsync(inputValue) {
  return yeepClient.api().then((api) => {
    return api.org
      .list({
        q: inputValue || undefined,
        limit: 10,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchOrgOptionsAsync),
      })
      .then((data) => {
        return data.orgs.map((e) => OrgOption.fromRecord(e).toOption());
      });
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
      .then((data) => {
        return data.permissions.map((e) => PermissionOption.fromRecord(e).toOption());
      });
  });
}

const RoleForm = ({ onSubmit, onCancel, onDelete, defaultValues, withDangerZone }) => {
  const [name, setName] = useState(defaultValues.name || '');
  const [description, setDescription] = useState(defaultValues.description || '');
  const [org, setOrg] = useState(
    defaultValues.org ? OrgOption.fromRecord(defaultValues.org).toOption() : null
  );
  const [permissions, setPermissions] = useState(
    (defaultValues.permissions || []).map((e) => PermissionOption.fromRecord(e).toOption())
  );

  const getValue = useCallback(() => {
    return {
      name,
      description,
      org: org ? OrgOption.fromOption(org).toRecord() : null,
      permissions: permissions.map((e) => PermissionOption.fromOption(e).toRecord()),
    };
  }, [name, description, org, permissions]);

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
      onSubmit(getValue());
    },
    [onSubmit, getValue]
  );

  return (
    <form onSubmit={onFormSubmit}>
      <fieldset className="mb-6">
        <legend>Permission details</legend>

        <div className="form-group mb-4">
          <label htmlFor="name" className="">
            Name
          </label>
          <Input id="name" className="w-full sm:w-1/2" value={name} onChange={onChangeName} />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="description" className="">
            Description (optional)
          </label>
          <Textarea
            id="description"
            className="w-full"
            rows="3"
            value={description}
            onChange={onChangeDescription}
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="org" className="">
            Organization scope (optional)
          </label>
          <AsyncSelect
            id="org"
            className="w-full sm:w-1/2"
            placeholder="Choose an organization"
            loadOptions={fetchOrgOptionsAsync}
            isClearable={true}
            defaultOptions={true}
            value={org}
            onChange={setOrg}
            isDisabled={defaultValues.org != null}
          />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="permissions" className="">
            Permissions
          </label>
          <AsyncSelect
            id="permissions"
            className="w-full sm:w-3/4"
            placeholder="Add role permissions"
            loadOptions={fetchPermissionOptionsAsync}
            isMulti={true}
            isClearable={true}
            defaultOptions={true}
            value={permissions}
            onChange={setPermissions}
          />
        </div>
        <div className="form-submit">
          <Button type="submit">Save</Button>
          <button type="button" className="pseudolink ml-4" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
      {withDangerZone && (
        <fieldset className="mb-6">
          <legend>Danger zone</legend>
          <Button type="button" danger={true} onClick={() => onDelete(getValue())}>
            Delete role
          </Button>
        </fieldset>
      )}
    </form>
  );
};

RoleForm.propTypes = {
  withDangerZone: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  defaultValues: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    org: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }).isRequired,
    permissions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
};

RoleForm.defaultProps = {
  withDangerZone: false,
  onSubmit: noop,
  onCancel: noop,
  onDelete: noop,
  defaultValues: {},
};

export default RoleForm;
