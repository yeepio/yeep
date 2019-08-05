import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { callbacks, closeRoleDeleteModal, deleteRole } from './roleModalsStore';

const RoleDeleteModal = () => {
  const displayedModal = useSelector((state) => state.roleModals.displayedModal);
  const role = useSelector((state) => state.roleModals.role);

  const roleDeleteError = useSelector((state) => state.roleModals.roleDeleteError);
  const isRoleDeletePending = useSelector((state) => state.roleModals.isRoleDeletePending);

  const dispatch = useDispatch();

  useEffect(() => {
    // i have issues with this logic. I dont expect its correct. Lets revisit
    if (displayedModal === 'ROLE_DELETE' && !isRoleDeletePending && isEmpty(roleDeleteError)) {
      dispatch(closeRoleDeleteModal());
    }
  }, [dispatch, isRoleDeletePending, roleDeleteError]);

  // modalClose will cancel and close the modal
  const modalClose = useCallback(() => {
    callbacks.onRoleDeleteCancel();
    dispatch(closeRoleDeleteModal());
  }, [dispatch]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const modalSubmit = useCallback(() => {
    callbacks.onRoleDeleteSubmit();
    dispatch(deleteRole({ id: role.id }));
  }, [dispatch, role]);

  if (displayedModal !== 'ROLE_DELETE' || !role.id) {
    return null;
  }

  return (
    <Modal onClose={modalClose}>
      <h2 className="mb-4">Delete role &quot;{role.name}&quot;?</h2>
      <p className="mb-4">
        Please note <Link to="/users">{role.usersCount}</Link> users have this role assigned to them.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button
          danger
          onClick={modalSubmit}
          disabled={isRoleDeletePending}
          className={classnames({
          'opacity-50 cursor-not-allowed': isRoleDeletePending,
          })}
        >
          {isRoleDeletePending && <LoadingIndicator />}
          {!isRoleDeletePending && 'Delete role'}
        </Button>
      </p>
    </Modal>
  );
};

export default RoleDeleteModal;
