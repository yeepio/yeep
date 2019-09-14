import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classnames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import {
  deletePermission,
  hidePermissionDeleteForm,
  clearPermissionDeleteForm,
} from './permissionStore';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';

const PermissionDeleteModal = ({ onSuccess, onError }) => {
  const record = useSelector((state) => state.permission.delete.record);
  const isDeletePending = useSelector((state) => state.permission.delete.isDeletePending);
  const isDisplayed = useSelector((state) => state.permission.delete.isDisplayed);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearPermissionDeleteForm());
    dispatch(hidePermissionDeleteForm());
  }, [dispatch]);

  const onDelete = React.useCallback(() => {
    dispatch(deletePermission({ id: record.id })).then((isPermissionDeleted) => {
      if (isPermissionDeleted) {
        dispatch(clearPermissionDeleteForm());
        dispatch(hidePermissionDeleteForm());
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, record, onError, onSuccess]);

  if (record.id == null || !isDisplayed) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h2 className="font-bold text-2xl mb-4">Delete permission &quot;{record.name}&quot;?</h2>
      {record.rolesCount !== 0 && (
        <p className="mb-4">
          Please note that {record.name} is present in {record.rolesCount} roles.
        </p>
      )}
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button
          danger
          onClick={onDelete}
          disabled={isDeletePending}
          className={classnames({
            'opacity-50 cursor-not-allowed': isDeletePending,
          })}
        >
          {isDeletePending ? <LoadingIndicator /> : 'Delete Permission'}
        </Button>
      </p>
    </Modal>
  );
};

PermissionDeleteModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

PermissionDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default PermissionDeleteModal;
