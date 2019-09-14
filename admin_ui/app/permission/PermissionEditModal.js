import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearPermissionUpdateForm,
  updatePermission,
  hidePermissionUpdateForm,
} from './permissionStore';
import PermissionForm from './PermissionForm';
import Modal from '../../components/Modal';

const PermissionEditModal = ({ onSuccess, onError }) => {
  const errors = useSelector((state) => state.permission.update.errors);
  const record = useSelector((state) => state.permission.update.record);
  const isSavePending = useSelector((state) => state.permission.update.isSavePending);
  const isDisplayed = useSelector((state) => state.permission.update.isDisplayed);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearPermissionUpdateForm());
    dispatch(hidePermissionUpdateForm());
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
          dispatch(clearPermissionUpdateForm());
          dispatch(hidePermissionUpdateForm());
          onSuccess();
        } else {
          onError();
        }
      });
    },
    [dispatch, onError, onSuccess]
  );

  if (record.id == null || !isDisplayed) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h1 className="font-semibold text-3xl mb-6">Edit permission {record.name}</h1>
      <PermissionForm
        defaultValues={record}
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
