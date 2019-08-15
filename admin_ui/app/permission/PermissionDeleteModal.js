import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { closePermissionDeleteModal, deletePermission } from './permissionStore';

const PermissionDeleteModal = ({ onSuccess, onError, onCancel }) => {
  const isOpen = useSelector((state) => state.permission.deletion.isOpen);
  const record = useSelector((state) => state.permission.deletion.record);
  const isDeletePending = useSelector((state) => state.permission.deletion.isDeletePending);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const onModalClose = useCallback(() => {
    onCancel();
    dispatch(closePermissionDeleteModal());
  }, [dispatch, onCancel]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const onModalSubmit = useCallback(() => {
    dispatch(deletePermission({ id: record.id })).then((isPermissionDeleted) => {
      if (isPermissionDeleted) {
        dispatch(closePermissionDeleteModal());
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, record, onSuccess, onError]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onModalClose}>
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
          onClick={onModalSubmit}
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
  onCancel: PropTypes.func,
};

PermissionDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
  onCancel: noop,
};

export default PermissionDeleteModal;
