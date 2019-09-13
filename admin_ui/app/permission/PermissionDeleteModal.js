import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import PermissionDeleteModal from '../../components/PermissionDeleteModal';
import { closePermissionDeleteModal, deletePermission } from './permissionStore';

const ConnectedPermissionDeleteModal = ({ onSuccess, onError }) => {
  const isOpen = useSelector((state) => state.permission.deletion.isOpen);
  const record = useSelector((state) => state.permission.deletion.record);
  // const errors = useSelector((state) => state.permission.deletion.errors);
  const isDeletePending = useSelector((state) => state.permission.deletion.isDeletePending);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(closePermissionDeleteModal());
  }, [dispatch]);

  const onDelete = React.useCallback(() => {
    dispatch(deletePermission({ id: record.id })).then((isPermissionDeleted) => {
      if (isPermissionDeleted) {
        dispatch(closePermissionDeleteModal());
        onSuccess();
      } else {
        onError();
      }
    });
  }, [dispatch, record, onError, onSuccess]);

  return (
    <PermissionDeleteModal
      record={record}
      onDelete={onDelete}
      onDismiss={onDismiss}
      isOpen={isOpen}
      isDeletePending={isDeletePending}
    />
  );
};

ConnectedPermissionDeleteModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
};

ConnectedPermissionDeleteModal.defaultProps = {
  onError: noop,
  onCancel: noop,
};

export default ConnectedPermissionDeleteModal;
