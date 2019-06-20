import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import { callbacks, closePermissionEditModal, editPermission } from './modalStore';

const PermissionEditModal = () => {
  const displayedModal = useSelector((state) => state.modal.displayedModal);
  const permission = useSelector((state) => state.modal.permission);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    callbacks.onPermissionEditCancel();
    dispatch(closePermissionEditModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    callbacks.onPermissionEditSubmit(permission);
    dispatch(closePermissionEditModal());
    dispatch(editPermission(permission));
  }, [dispatch, permission]);

  if (displayedModal !== "PERMISSION_EDIT") {
    return null;
  }

  return (
    <Modal onClose={modalClose} className="sm:w-4/5">
      <h2 className="mb-4">Edit permission</h2>
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

export default PermissionEditModal;
