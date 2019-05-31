import React from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../../../components/Modal';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Textarea from '../../../components/Textarea';
import { setDisplayedModal } from '../orgStore';

// The Create permission modal
const PermissionCreate = () => {
  const dispatch = useDispatch();

  return (
    <Modal onClose={() => dispatch(setDisplayedModal(''))} className="sm:w-4/5">
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
};

export default PermissionCreate;