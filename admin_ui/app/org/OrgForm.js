import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Input from '../../components/Input';
import Button from '../../components/Button';

const OrgForm = ({ defaultValues, isSavePending, errors, onSubmit, onCancel, onDelete }) => {
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
        <legend>Organisation details</legend>
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
          <label htmlFor="slug" className="">
            Slug
          </label>
          <Input
            id="slug"
            className="w-full sm:w-1/2"
            value={values.slug}
            onChange={(event) => setValues({ ...values, slug: event.target.value })}
            disabled={isSavePending}
          />
          {errors.slug && <p className="invalid mt-2">{errors.slug}</p>}
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
      {values.id != null && (
        <fieldset className="mb-6">
          <legend>Danger zone</legend>
          <Button type="button" danger={true} onClick={() => onDelete(values)}>
            Delete org
          </Button>
        </fieldset>
      )}
    </form>
  );
};

OrgForm.propTypes = {
  defaultValues: PropTypes.object,
  errors: PropTypes.object,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  isSavePending: PropTypes.bool,
};

OrgForm.defaultProps = {
  defaultValues: {
    name: '',
    slug: '',
  },
  errors: {},
  onSubmit: noop,
  onCancel: noop,
  onDelete: noop,
  isSavePending: false,
};

export default OrgForm;
