import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearPermissionCreateForm,
  hidePermissionCreateForm,
  createPermission,
} from './permissionStore';
import PermissionForm from './PermissionForm';
import Modal from '../../components/Modal';

const PermissionCreateModal = ({ onSuccess, onError }) => {
  const errors = useSelector((state) => state.permission.create.errors);
  const isSavePending = useSelector((state) => state.permission.create.isSavePending);
  const isDisplayed = useSelector((state) => state.permission.create.isDisplayed);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearPermissionCreateForm());
    dispatch(hidePermissionCreateForm());
  }, [dispatch]);

  const submitForm = React.useCallback(
    (values) => {
      dispatch(
        createPermission({
          name: values.name,
          description: values.description,
          scope: values.org ? values.org.id : null,
        })
      ).then((isPermissionCreated) => {
        if (isPermissionCreated) {
          dispatch(clearPermissionCreateForm());
          dispatch(hidePermissionCreateForm());
          onSuccess();
        } else {
          onError();
        }
      });
    },
    [dispatch, onError, onSuccess]
  );

  if (!isDisplayed) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h1 className="font-semibold text-3xl mb-6">Create permission</h1>
      <PermissionForm
        isSavePending={isSavePending}
        errors={errors}
        onCancel={onDismiss}
        onSubmit={submitForm}
      />
    </Modal>
  );
};

PermissionCreateModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

PermissionCreateModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default PermissionCreateModal;
