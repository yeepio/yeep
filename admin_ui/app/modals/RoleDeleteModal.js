import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import { Link } from '@reach/router';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { closeRoleDeleteModal, deleteRole } from './roleModalsStore';

const RoleDeleteModal = ({ onSuccess, onError, onCancel }) => {
  const displayedModal = useSelector((state) => state.roleModals.displayedModal);
  const role = useSelector((state) => state.roleModals.role);
  // const roleDeleteError = useSelector((state) => state.roleModals.roleDeleteError);
  const isRoleDeletePending = useSelector((state) => state.roleModals.isRoleDeletePending);

  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const onModalClose = useCallback(() => {
    onCancel();
    dispatch(closeRoleDeleteModal());
  }, [dispatch, onCancel]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const onModalSubmit = useCallback(() => {
    dispatch(deleteRole({ id: role.id })).then((isRoleDeleted) => {
      dispatch(closeRoleDeleteModal());
      if (isRoleDeleted) {
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, role, onSuccess, onError]);

  if (displayedModal !== 'ROLE_DELETE' || !role.id) {
    return null;
  }

  return (
    <Modal onClose={onModalClose}>
      <h2 className="mb-4">Delete role &quot;{role.name}&quot;?</h2>
      <p className="mb-4">
        Please note <Link to="/users">{role.usersCount}</Link> users have this role assigned to
        them.
      </p>
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button
          danger
          onClick={onModalSubmit}
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

RoleDeleteModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
};

RoleDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
  onCancel: noop,
};

export default RoleDeleteModal;
