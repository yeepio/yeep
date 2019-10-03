import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { hideUserDeleteForm, clearUserDeleteForm, deleteUser } from './userStore';

const UserDeleteModal = ({ onSuccess, onError }) => {
  const isDisplayed = useSelector((state) => state.user.delete.isDisplayed);
  const record = useSelector((state) => state.user.delete.record);
  const isDeletePending = useSelector((state) => state.user.delete.isDeletePending);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearUserDeleteForm());
    dispatch(hideUserDeleteForm());
  }, [dispatch]);

  const onDelete = React.useCallback(() => {
    dispatch(deleteUser({ id: record.id })).then((isUserDeleted) => {
      if (isUserDeleted) {
        dispatch(clearUserDeleteForm());
        dispatch(hideUserDeleteForm());
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, record, onSuccess, onError]);

  if (record.id == null || !isDisplayed) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h2 className="mb-4">Delete user &quot;{record.username}&quot;?</h2>
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
          {isDeletePending ? <LoadingIndicator /> : 'Delete org'}
        </Button>
      </p>
    </Modal>
  );
};

UserDeleteModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

UserDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default UserDeleteModal;
