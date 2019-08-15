import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { closeRoleDeleteModal, deleteRole } from './roleStore';

const RoleDeleteModal = ({ onSuccess, onError, onCancel }) => {
  const isOpen = useSelector((state) => state.role.deletion.isOpen);
  const record = useSelector((state) => state.role.deletion.record);
  const isDeletePending = useSelector((state) => state.role.deletion.isDeletePending);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const onModalClose = useCallback(() => {
    onCancel();
    dispatch(closeRoleDeleteModal());
  }, [dispatch, onCancel]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const onModalSubmit = useCallback(() => {
    dispatch(deleteRole({ id: record.id })).then((isRoleDeleted) => {
      if (isRoleDeleted) {
        dispatch(closeRoleDeleteModal());
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, record, onSuccess, onError]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onModalClose}>
      <h2 className="mb-4">Delete role &quot;{record.name}&quot;?</h2>
      {/* <p className="mb-4">
        Please note <Link to="/users">{role.usersCount}</Link> users have this role assigned to
        them.
      </p> */}
      <p className="mb-4">
        <strong>Warning: This action cannot be undone!</strong>
      </p>
      <p className="text-center">
        <Button
          danger
          onClick={onModalSubmit}
          disabled={isDeletePending}
          className={classnames({
            'opacity-50 cursor-not-allowed': isDeletePending,
          })}
        >
          {isDeletePending ? <LoadingIndicator /> : 'Delete role'}
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
