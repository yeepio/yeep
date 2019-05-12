import React, { useContext } from 'react';
import Store from '../../Store';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { Link } from '@reach/router';

// The Create permission modal
const PermissionDelete = () => {
  // Load the store
  const store = useContext(Store);
  return (
    <Modal onClose={() => store.org.displayedModal$.next('')}>
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
