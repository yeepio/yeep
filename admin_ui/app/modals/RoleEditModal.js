import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Textarea from '../../components/Textarea';
import Select from 'react-select';
import { callbacks, closeRoleEditModal, editRole } from './roleModalsStore';

const RoleEditModal = () => {
  const displayedModal = useSelector((state) => state.roleModals.displayedModal);
  const role = useSelector((state) => state.roleModals.role);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    callbacks.onRoleEditCancel();
    dispatch(closeRoleEditModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    callbacks.onRoleEditSubmit(role);
    dispatch(closeRoleEditModal());
    dispatch(editRole(role));
  }, [dispatch, role]);

  if (displayedModal !== 'ROLE_EDIT') {
    return null;
  }

  return (
    <Modal onClose={modalClose} className="sm:w-4/5">
      <h2 className="mb-4">Edit role</h2>
      <div className="form-group mb-4">
        <label htmlFor="org-name">Organization scope:</label>
        <strong className="self-center">Our Tech Blog (org id: 1)</strong>
      </div>
      <div className="form-group mb-4">
        <label htmlFor="role-name">Name:</label>
        <Input id="role-name" placeholder='e.g. "blog_admin"' className="w-full sm:w-1/2" />
      </div>
      <div className="form-group mb-4">
        <label htmlFor="role-description">Description:</label>
        <Textarea
          id="role-description"
          placeholder="Enter a description for this role"
          className="w-full sm:w-1/2"
          rows="6"
        />
      </div>
      <div className="sm:flex mb-4">
        <div className="sm:w-1/4">Permissions:</div>
        <div className="sm:w-3/4">
          <Select
            isMulti
            className="w-full mb-4"
            placeholder="Choose one or more permissions"
            options={[
              { value: 1, label: 'blog.read' },
              { value: 2, label: 'blog.write' },
              { value: 3, label: 'yeep.org.write' },
              { value: 4, label: 'yeep.org.read' },
              { value: 5, label: 'yeep.users.read' },
              { value: 6, label: 'yeep.users.write' },
              { value: 7, label: 'yeep.someperm.1' },
              { value: 8, label: 'yeep.someperm.2' },
              { value: 9, label: 'yeep.someperm.2' },
              { value: 10, label: 'crm.access.1', isDisabled: true },
              { value: 11, label: 'crm.access.2', isDisabled: true },
              { value: 12, label: 'crm.access.3', isDisabled: true },
            ]}
            defaultValue={[{ value: 1, label: 'blog.read' }, { value: 2, label: 'blog.write' }]}
          />
        </div>
      </div>
      <div className="form-submit">
        <Button onClick={modalSubmit}>Save changes</Button>
      </div>
    </Modal>
  );
};

export default RoleEditModal;
