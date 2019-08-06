import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { callbacks, closePermissionDeleteModal, deletePermission } from './permissionModalsStore';

const PermissionDeleteModal = ({ onSuccess, onError, onCancel }) => {
  const displayedModal = useSelector((state) => state.permissionModals.displayedModal);
  const permission = useSelector((state) => state.permissionModals.permission);
  // deleteModals permissionDeleteError = useSelector((state) => state.deleteModals.permissionDeleteError);
  const isPermissionDeletePending = useSelector((state) => state.permissionModals.isPermissionDeletePending);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const onModalClose = useCallback(() => {
    onCancel();
    dispatch(closePermissionDeleteModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const onModalSubmit = useCallback(() => {
    dispatch(deletePermission({ id: permission.id })).then((isPermissionDeleted) => {
      dispatch(closePermissionDeleteModal());
      if (isPermissionDeleted) {
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, permission, onSuccess, onError]);

  if (displayedModal !== 'PERMISSION_DELETE' || !permission.id) {
    return null;
  }

  return (
    <Modal onClose={onModalClose}>
      <h2 className="font-bold text-2xl mb-4">Delete permission &quot;{permission.name}&quot;?</h2>
      <p className="mb-4">
        Please note that {permission.name} is present in <Link to="/roles">{permission.rolesCount}</Link> roles.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button
          danger
          onClick={onModalSubmit}
          disabled={isPermissionDeletePending}
          className={classnames({
            'opacity-50 cursor-not-allowed': isPermissionDeletePending,
          })}
        >
          {isPermissionDeletePending && <LoadingIndicator />}
          {!isPermissionDeletePending && 'Delete Permission'}
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
