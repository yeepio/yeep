import React, { useContext } from 'react';
import Store from '../../Store';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { Link } from '@reach/router';

// The Create permission modal
const RoleDelete = () => {
  // Load the store
  const store = useContext(Store);
  return (
    <Modal onClose={() => store.org.currentRolesModal$.next('')}>
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
