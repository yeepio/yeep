import React from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { Link } from '@reach/router';
import { setDisplayedModal } from '../orgStore';

// The Create permission modal
const RoleDelete = () => {
  const dispatch = useDispatch();

  return (
    <Modal onClose={() => dispatch(setDisplayedModal(''))}>
      <h2 className="mb-4">Delete role &quot;blog_admin&quot;?</h2>
      <p className="mb-4">
        Please note <Link to="/users">12</Link> users have this role assigned to them.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button danger={true}>Delete role</Button>
      </p>
    </Modal>
  );
};

export default RoleDelete;
