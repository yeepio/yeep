import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
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
    () => store.org.currentModal$,
    store.org.currentModal$.getValue()
  );

  if (currentModal === 'CREATE') {
    return (
      <Modal onClose={() => store.org.currentModal$.next('')}>
        <h1 className="mb-4">Create new permission</h1>
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
      <Modal onClose={() => store.org.currentModal$.next('')}>Hello I am the edit modal</Modal>
    );
  } else if (currentModal === 'DELETE') {
    return (
      <Modal onClose={() => store.org.currentModal$.next('')}>Hello I am the delete modal</Modal>
    );
  }

  return null;
};

export default OrgEditPermissionsModals;
