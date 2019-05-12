import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';

const RoleDeleteModal = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const deleteModal = useObservable(
    () => store.role.deleteModal$,
    store.role.deleteModal$.getValue()
  );

  if (deleteModal === 'DELETE') {
    return (
      <Modal onClose={() => store.role.deleteModal$.next('')}>
        <h2 className="mb-4">Delete role &quot;blog_admin&quot;?</h2>
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
