import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { deleteRole, hideRoleDeleteForm, clearRoleDeleteForm } from './roleStore';

const RoleDeleteModal = ({ onSuccess, onError }) => {
  const isDisplayed = useSelector((state) => state.role.delete.isDisplayed);
  const record = useSelector((state) => state.role.delete.record);
  const isDeletePending = useSelector((state) => state.role.delete.isDeletePending);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearRoleDeleteForm());
    dispatch(hideRoleDeleteForm());
  }, [dispatch]);

  const onDelete = React.useCallback(() => {
    dispatch(deleteRole({ id: record.id })).then((isRoleDeleted) => {
      if (isRoleDeleted) {
        dispatch(clearRoleDeleteForm());
        dispatch(hideRoleDeleteForm());
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, record, onError, onSuccess]);

  if (record.id == null || !isDisplayed) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
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
          onClick={onDelete}
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
};

RoleDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default RoleDeleteModal;
