import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/lib/Async';
import noop from 'lodash/noop';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import yeepClient from '../yeepClient';
import Button from '../../components/Button';
import OrgOption from '../../utilities/OrgOption';

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

const PermissionForm = ({ defaultValues, isSavePending, errors, onSubmit, onCancel, onDelete }) => {
  const [values, setValues] = React.useState(defaultValues);

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
            onChange={(event) => setValues({ ...values, name: event.target.value })}
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
            onChange={(event) => setValues({ ...values, description: event.target.value })}
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
            onChange={(selectedOption) =>
              setValues({
                ...values,
                org: selectedOption ? OrgOption.fromOption(selectedOption).toRecord() : null,
              })
            }
            isDisabled={isSavePending || values.id != null}
          />
          {errors.org && <p className="text-red mt-2">{errors.org}</p>}
        </div>
        <div className="form-submit">
          <Button type="submit" disabled={isSavePending}>
            Save
          </Button>
          <button
            type="button"
            className="pseudolink ml-4"
            onClick={onCancel}
            disabled={isSavePending}
          >
            Cancel
          </button>
        </div>
      </fieldset>
      {values.id != null && onDelete !== noop && (
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
  defaultValues: PropTypes.object,
  errors: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  isSavePending: PropTypes.bool,
};

PermissionForm.defaultProps = {
  defaultValues: {},
  errors: {},
  onSubmit: noop,
  onCancel: noop,
  onDelete: noop,
  isSavePending: false,
};

export default PermissionForm;
