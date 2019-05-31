import React from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { Link } from '@reach/router';
import { setDisplayedModal } from '../orgStore';

// The Create permission modal
const PermissionDelete = () => {
  const dispatch = useDispatch();

  return (
    <Modal onClose={() => dispatch(setDisplayedModal(''))}>
      <h2 className="mb-4">Delete permission &quot;blog.read&quot;?</h2>
      <p className="mb-4">
        Please note that blog.read is present in <Link to="/roles">4</Link> roles.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button danger={true}>Delete permission</Button>
      </p>
    </Modal>
  );
};

export default PermissionDelete;
