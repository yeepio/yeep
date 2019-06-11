import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import { setDeleteModal } from './roleStore';

const RoleDeleteModal = () => {
  const deleteModal = useSelector((state) => state.role.deleteModal);
  const dispatch = useDispatch();

  if (deleteModal === 'DELETE') {
    return (
      <Modal onClose={() => dispatch(setDeleteModal(''))}>
        <h2 className="font-bold text-2xl mb-4">Delete role &quot;blog_admin&quot;?</h2>
        <p className="mb-4">
          Please note that blog_admin has been associated with <Link to="/users">2</Link> users.
        </p>
        <p className="mb-4">
          <strong>Warning: This action cannot be undone!</strong>
        </p>
        <p className="text-center">
          <Button danger={true}>Delete role</Button>
        </p>
      </Modal>
    );
  } else {
    return null;
  }
};

export default RoleDeleteModal;
