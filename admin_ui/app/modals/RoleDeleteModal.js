import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import { callbacks, closeRoleDeleteModal, deleteRole } from './roleModalsStore';

const RoleDeleteModal = () => {
  const displayedModal = useSelector((state) => state.roleModals.displayedModal);
  const role = useSelector((state) => state.roleModals.role);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    callbacks.onRoleDeleteCancel();
    dispatch(closeRoleDeleteModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    callbacks.onRoleDeleteSubmit();
    dispatch(closeRoleDeleteModal());
    dispatch(deleteRole(role));
  }, [dispatch, role]);

  if (displayedModal !== 'ROLE_DELETE' || !role.id) {
    return null;
  }

  return (
    <Modal onClose={modalClose}>
      <h2 className="mb-4">Delete role &quot;blog_admin&quot;?</h2>
      <p className="mb-4">
        Please note <Link to="/users">12</Link> users have this role assigned to them.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button danger={true} onClick={modalSubmit}>
          Delete role
        </Button>
      </p>
    </Modal>
  );
};

export default RoleDeleteModal;
