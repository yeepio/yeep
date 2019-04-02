import React, { useContext, useEffect } from 'react';
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

  const handleESC = (e) => {
    if (e.key === 'Escape') {
      // ESC key pressed. Hide any modals
      store.permission.deleteModal$.next('');
    }
  };

  // Hide any modal on ESC keypress
  // This will be an effect (with cleanup).
  // We pass [] as second argument to avoid multiple add + remove invocaitons
  // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects for details
  useEffect(() => {
    // console.log('useEffect called!!!');
    window.document.addEventListener('keydown', handleESC);
    return () => {
      // console.log('useEffect: removing listener');
      window.removeEventListener('keydown', handleESC);
    };
  }, []);

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
