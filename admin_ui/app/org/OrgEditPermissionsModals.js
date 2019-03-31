import React, { useContext, useEffect } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import { Link } from '@reach/router';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Textarea from '../../components/Textarea';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditPermissionsModals = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const currentModal = useObservable(
    () => store.org.currentPermissionsModal$,
    store.org.currentPermissionsModal$.getValue()
  );

  const handleESC = (e) => {
    if (e.which === 27) {
      // ESC key pressed. Hide any modals
      store.org.currentPermissionsModal$.next('');
    }
  };

  // Hide any modal on ESC keypress
  // This will be an effect (with cleanup).
  // We pass [] as second argument to avoid multiple add + remove invocaitons
  // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects for details
  useEffect(() => {
    // console.log('useEffect called!!!');
    window.document.addEventListener('keyup', handleESC);
    return () => {
      // console.log('useEffect: removing listener');
      window.removeEventListener('keyup', handleESC);
    };
  }, []);

  if (currentModal === 'CREATE') {
    return (
      <Modal onClose={() => store.org.currentPermissionsModal$.next('')} className="sm:w-4/5">
        <h2 className="mb-4">Create new permission</h2>
        <div className="form-group mb-4">
          <label htmlFor="org-name">Organization scope:</label>
          <strong className="self-center">Our Tech Blog (org id: 1)</strong>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="permission-name">Name:</label>
          <Input id="permission-name" placeholder='e.g. "blog.read"' className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="permission-description">Description:</label>
          <Textarea
            id="permission-description"
            placeholder="Enter a description for this permission"
            className="w-full sm:w-1/2"
            rows="6"
          />
        </div>
        <div className="form-submit">
          <Button>Save changes</Button>
        </div>
      </Modal>
    );
  } else if (currentModal === 'EDIT') {
    return (
      <Modal onClose={() => store.org.currentPermissionsModal$.next('')} className="sm:w-4/5">
        <h2 className="mb-4">Edit permission</h2>
        <div className="form-group mb-4">
          <label htmlFor="org-name">Organization scope:</label>
          <strong className="self-center">Our Tech Blog (org id: 1)</strong>
        </div>
        <div className="form-group mb-4">
          <label htmlFor="permission-name">Name:</label>
          <Input
            id="permission-name"
            placeholder='e.g. "blog.read"'
            className="w-full sm:w-1/2"
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="permission-description">Description:</label>
          <Textarea
            id="permission-description"
            placeholder="Enter a description for this permission"
            className="w-full sm:w-1/2"
            rows="6"
          />
        </div>
        <div className="form-submit">
          <Button>Save changes</Button>
        </div>
      </Modal>
    );
  } else if (currentModal === 'DELETE') {
    return (
      <Modal onClose={() => store.org.currentPermissionsModal$.next('')}>
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
  }

  return null;
};

export default OrgEditPermissionsModals;
