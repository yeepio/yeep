import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { setOrgFormValues } from './orgStore';

const OrgForm = ({ onSubmit, onCancel, onDelete, type }) => {
  const errors = useSelector((state) => state.org.form.errors);
  const values = useSelector((state) => state.org.form.values);
  const isSavePending = useSelector((state) => state.org.form.isSavePending);

  const dispatch = useDispatch();

  const onChangeName = useCallback(
    (event) => {
      dispatch(setOrgFormValues({ name: event.target.value }));
    },
    [dispatch]
  );

  const onChangeSlug = useCallback(
    (event) => {
      dispatch(setOrgFormValues({ slug: event.target.value }));
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
            onChange={onChangeName}
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
            onChange={onChangeSlug}
          />
          {errors.slug && <p className="invalid mt-2">{errors.slug}</p>}
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
            Delete org
          </Button>
        </fieldset>
      )}
    </form>
  );
};

OrgForm.propTypes = {
  type: PropTypes.oneOf(['create', 'update']),
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
};

OrgForm.defaultProps = {
  type: 'create',
  onSubmit: noop,
  onCancel: noop,
  onDelete: noop,
};

export default OrgForm;
