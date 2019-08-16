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
import { setPermissionFormValues } from './permissionStore';

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

const PermissionForm = ({ onSubmit, onCancel, onDelete, type }) => {
  const errors = useSelector((state) => state.permission.form.errors);
  const values = useSelector((state) => state.permission.form.values);
  const isSavePending = useSelector((state) => state.permission.form.isSavePending);

  const dispatch = useDispatch();

  const onChangeName = useCallback(
    (event) => {
      dispatch(setPermissionFormValues({ name: event.target.value }));
    },
    [dispatch]
  );

  const onChangeDescription = useCallback(
    (event) => {
      dispatch(setPermissionFormValues({ description: event.target.value }));
    },
    [dispatch]
  );

  const onChangeOrg = useCallback(
    (selectedOption) => {
      dispatch(
        setPermissionFormValues({
          org: selectedOption ? OrgOption.fromOption(selectedOption).toRecord() : null,
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
            disabled={isSavePending}
          />
          {errors.name && <p className="invalid mt-2">{errors.name}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="description">Description (optional)</label>
          <Textarea
            id="description"
            className="w-full"
            rows="3"
            value={values.description}
            onChange={onChangeDescription}
            disabled={isSavePending}
          />
          {errors.description && <p className="invalid mt-2">{errors.description}</p>}
        </div>
        <div className="form-group mb-4">
          <label htmlFor="org">Organization scope (optional)</label>
          <AsyncSelect
            id="org"
            className="w-full sm:w-1/2"
            placeholder="Choose an organization"
            loadOptions={fetchOrgOptionsAsync}
            isClearable={true}
            defaultOptions={true}
            value={values.org ? OrgOption.fromRecord(values.org).toOption() : null}
            onChange={onChangeOrg}
            isDisabled={isSavePending || type === 'update'}
          />
          {errors.org && <p className="text-red mt-2">{errors.org}</p>}
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
            Delete permission
          </Button>
        </fieldset>
      )}
    </form>
  );
};

PermissionForm.propTypes = {
  type: PropTypes.oneOf(['create', 'update']),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
};

PermissionForm.defaultProps = {
  type: 'create',
  onSubmit: noop,
  onCancel: noop,
  onDelete: noop,
};

export default PermissionForm;
