import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { callbacks, closePermissionCreateModal, createPermission } from './modalStore';

const PermissionCreateModal = () => {
  const displayedModal = useSelector((state) => state.modal.displayedModal);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    callbacks.onPermissionCreateCancel();
    dispatch(closePermissionCreateModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    callbacks.onPermissionCreateSubmit();
    dispatch(closePermissionCreateModal());
    dispatch(createPermission({
      name: "Test",
      description: "Lorem ipsum dolor"
    }));
  }, [dispatch]);

  if (displayedModal !== "PERMISSION_CREATE") {
    return null;
  }

  return (
    <Modal onClose={modalClose} className="sm:w-4/5">
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
        <Button onClick={modalSubmit}>Save changes</Button>
      </div>
    </Modal>

  );
};

export default PermissionCreateModal;
