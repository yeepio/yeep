import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';

const PermissionDeleteModal = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const deleteModal = useObservable(
    () => store.permission.deleteModal$,
    store.permission.deleteModal$.getValue()
  );

  if (deleteModal === 'DELETE') {
    return (
      <Modal onClose={() => store.permission.deleteModal$.next('')}>
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
  } else {
    return null;
  }
};

export default PermissionDeleteModal;
