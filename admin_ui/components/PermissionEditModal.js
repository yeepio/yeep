import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Modal from './Modal';
import PermissionForm from './PermissionForm';

const PermissionEditModal = ({ isOpen, record, onDismiss, ...otherProps }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h2 className="font-bold text-2xl mb-4">Edit permission &quot;{record.name}&quot;?</h2>
      <PermissionForm {...otherProps} defaultValues={record} />
    </Modal>
  );
};

PermissionEditModal.propTypes = {
  isOpen: PropTypes.bool,
  record: PropTypes.object.isRequired,
  onDismiss: PropTypes.func,
};

PermissionEditModal.defaultProps = {
  isOpen: false,
  onDismiss: noop,
};

export default PermissionEditModal;
