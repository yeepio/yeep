import React, { useContext, useCallback } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const PermissionDeleteModal = () => {
  // Load the store
  const store = useContext(Store);
  const [id, name] = useObservable(
    () =>
      combineLatest(store.modals.permissionDelete.id$, store.modals.permissionDelete.name$).pipe(
        debounceTime(0)
      ),
    [store.modals.permissionDelete.id$.getValue(), store.modals.permissionDelete.name$.getValue()]
  );

  // Memo-ize the stuff that need to be called when the modal is closed or submitted
  // using useCallback()

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    store.modals.permissionDelete.onCancel({ id });
    store.modals.permissionDelete.close();
  }, [id]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    store.modals.permissionDelete.onSubmit({ id });
    store.modals.permissionDelete.close();
    store.modals.permissionDelete.deletePermission({ id });
  }, [id]);

  if (!id) {
    return null;
  }
  return (
    <Modal onClose={modalClose}>
      <h2 className="mb-4">Delete permission &quot;{name}&quot;?</h2>
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
