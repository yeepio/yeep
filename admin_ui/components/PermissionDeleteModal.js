import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from './Modal';
import Button from './Button';
import LoadingIndicator from './LoadingIndicator';

const PermissionDeleteModal = ({ record, onDelete, onDismiss, isDeletePending, isOpen }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h2 className="font-bold text-2xl mb-4">Delete permission &quot;{record.name}&quot;?</h2>
      {record.rolesCount !== 0 && (
        <p className="mb-4">
          Please note that {record.name} is present in {record.rolesCount} roles.
        </p>
      )}
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
          {isDeletePending ? <LoadingIndicator /> : 'Delete Permission'}
        </Button>
      </p>
    </Modal>
  );
};

PermissionDeleteModal.propTypes = {
  record: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onDismiss: PropTypes.func,
  isOpen: PropTypes.bool,
  isDeletePending: PropTypes.bool,
};

PermissionDeleteModal.defaultProps = {
  onDelete: noop,
  onDismiss: noop,
  isOpen: false,
  isDeletePending: false,
};

export default PermissionDeleteModal;
