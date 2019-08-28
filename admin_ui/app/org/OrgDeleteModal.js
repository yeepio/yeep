import React, { useCallback } from 'react';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { closeOrgDeleteModal, deleteOrg } from './orgStore';

const OrgDeleteModal = ({ onSuccess, onError, onCancel }) => {
  const isOpen = useSelector((state) => state.org.deletion.isOpen);
  const record = useSelector((state) => state.org.deletion.record);
  const isDeletePending = useSelector((state) => state.org.deletion.isDeletePending);
  const dispatch = useDispatch();

  // modalClose will cancel and close the modal
  const onModalClose = useCallback(() => {
    onCancel();
    dispatch(closeOrgDeleteModal());
  }, [dispatch, onCancel]);

  // modalSubmit will call the submit method, close and then perform the deletion
  const onModalSubmit = useCallback(() => {
    dispatch(deleteOrg({ id: record.id })).then((isRoleDeleted) => {
      if (isRoleDeleted) {
        dispatch(closeOrgDeleteModal());
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
      <h2 className="mb-4">Delete org &quot;{record.name}&quot;?</h2>
      <p className="mb-4">
        Please note <Link to="/users">{record.usersCount}</Link> users have this org assigned to
        them.
      </p>
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
          {isDeletePending ? <LoadingIndicator /> : 'Delete org'}
        </Button>
      </p>
    </Modal>
  );
};

OrgDeleteModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  onCancel: PropTypes.func,
};

OrgDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
  onCancel: noop,
};

export default OrgDeleteModal;
