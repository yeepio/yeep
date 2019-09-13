import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import { resetPermissionFormValues, updatePermission } from './permissionStore';
import PermissionForm from '../../components/PermissionForm';
import LoadingIndicator from '../../components/LoadingIndicator';
import Modal from '../../components/Modal';

const PermissionEditModal = ({ onSuccess, onError }) => {
  const isLoading = useSelector((state) => state.permission.form.isLoading);
  const errors = useSelector((state) => state.permission.form.errors);
  const values = useSelector((state) => state.permission.form.values);
  const isSavePending = useSelector((state) => state.permission.form.isSavePending);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(resetPermissionFormValues());
  }, [dispatch]);

  const submitForm = React.useCallback(
    (nextValues) => {
      dispatch(
        updatePermission({
          id: nextValues.id,
          name: nextValues.name,
          description: nextValues.description,
        })
      ).then((isPermissionUpdated) => {
        if (isPermissionUpdated) {
          dispatch(resetPermissionFormValues());
          onSuccess();
        } else {
          onError();
        }
      });
    },
    [dispatch, onError, onSuccess]
  );

  if (values.id == null) {
    return null;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <Modal onClose={onDismiss}>
      <h1 className="font-semibold text-3xl mb-6">Edit permission {values.name}</h1>
      <PermissionForm
        defaultValues={values}
        isSavePending={isSavePending}
        errors={errors}
        onCancel={onDismiss}
        onSubmit={submitForm}
      />
    </Modal>
  );
};

PermissionEditModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

PermissionEditModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default PermissionEditModal;
