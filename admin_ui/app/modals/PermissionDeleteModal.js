import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import { callbacks, closePermissionDeleteModal, deletePermission } from './permissionModalsStore';

const PermissionDeleteModal = () => {
  const displayedModal = useSelector((state) => state.permissionModals.displayedModal);
  const permission = useSelector((state) => state.permissionModals.permission);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    callbacks.onPermissionDeleteCancel();
    dispatch(closePermissionDeleteModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    callbacks.onPermissionDeleteSubmit(permission);
    dispatch(closePermissionDeleteModal());
    dispatch(deletePermission(permission));
  }, [dispatch, permission]);

  if (displayedModal !== 'PERMISSION_DELETE' || !permission.id) {
    return null;
  }

  return (
    <Modal onClose={modalClose}>
      <h2 className="font-bold text-2xl mb-4">Delete permission &quot;{permission.name}&quot;?</h2>
      <p className="mb-4">
        Please note that blog.read is present in <Link to="/roles">XXX</Link> roles.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button danger={true} onClick={modalSubmit}>
          Delete permission
        </Button>
      </p>
    </Modal>
  );
};

export default PermissionDeleteModal;
