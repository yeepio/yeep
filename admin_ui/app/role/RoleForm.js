import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import noop from 'lodash/noop';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import yeepClient from '../yeepClient';
import Button from '../../components/Button';
import OrgOption from '../../utilities/OrgOption';
import PermissionOption from '../../utilities/PermissionOption';
import { setRoleFormValues } from './roleStore';

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

const RoleForm = ({ onSubmit, onCancel, onDelete, type }) => {
  const errors = useSelector((state) => state.role.form.errors);
  const values = useSelector((state) => state.role.form.values);
  const isSavePending = useSelector((state) => state.role.form.isSavePending);

  const dispatch = useDispatch();

  const onChangeName = useCallback(
    (event) => {
      dispatch(setRoleFormValues({ name: event.target.value }));
    },
    [dispatch]
  );

  const onChangeDescription = useCallback(
    (event) => {
      dispatch(setRoleFormValues({ description: event.target.value }));
    },
    [dispatch]
  );

  const onChangeOrg = useCallback(
    (selectedOption) => {
      dispatch(
        setRoleFormValues({
          org: selectedOption ? OrgOption.fromOption(selectedOption).toRecord() : null,
        })
      );
    },
    [dispatch]
  );

  const onChangePermissions = useCallback(
    (selectedOptions) => {
      dispatch(
        setRoleFormValues({
          permissions: selectedOptions
            ? selectedOptions.map((e) => PermissionOption.fromOption(e).toRecord())
            : null,
        })
      );
    },
    [dispatch]
  );

  const onFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      onSubmit(values);
    },
    [onSubmit, values]
  );

  return (
    <form onSubmit={onFormSubmit}>
      <fieldset className="mb-6">
        <legend>Permission details</legend>
        {errors.generic && (
          <div className="bg-red-lightest text-red rounded border border-red-lighter p-3 mb-4">
            {errors.generic}
          </div>
        )}
        <div className="form-group mb-4">
          <label htmlFor="name" className="">
            Name
          </label>
          <Input
            id="name"
            className="w-full sm:w-1/2"
            value={values.name}
            onChange={onChangeName}
          />
          {errors.name && <p className="invalid mt-2">{errors.name}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="description" className="">
            Description (optional)
          </label>
          <Textarea
            id="description"
            className="w-full"
            rows="3"
            value={values.description}
            onChange={onChangeDescription}
          />
          {errors.description && <p className="invalid mt-2">{errors.description}</p>}
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
            value={values.org ? OrgOption.fromRecord(values.org).toOption() : null}
            onChange={onChangeOrg}
            isDisabled={type === 'update'}
          />
          {errors.org && <p className="invalid mt-2">{errors.org}</p>}
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
            value={
              Array.isArray(values.permissions) && values.permissions.length !== 0
                ? values.permissions.map((e) => PermissionOption.fromRecord(e).toOption())
                : null
            }
            onChange={onChangePermissions}
          />
          {errors.permissions && <p className="invalid mt-2">{errors.permissions}</p>}
        </div>
        <div className="form-submit">
          <Button type="submit" disabled={isSavePending}>
            Save
          </Button>
          <button type="button" className="pseudolink ml-4" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
      {type === 'update' && (
        <fieldset className="mb-6">
          <legend>Danger zone</legend>
          <Button type="button" danger={true} onClick={() => onDelete(values)}>
            Delete role
          </Button>
        </fieldset>
      )}
    </form>
  );
};

RoleForm.propTypes = {
  type: PropTypes.oneOf(['create', 'update']),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
};

RoleForm.defaultProps = {
  type: 'create',
  onSubmit: noop,
  onCancel: noop,
  onDelete: noop,
};

export default RoleForm;
