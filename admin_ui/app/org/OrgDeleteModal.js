import React from 'react';
import { Link } from '@reach/router';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import noop from 'lodash/noop';
import classnames from 'classnames';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import LoadingIndicator from '../../components/LoadingIndicator';
import { hideOrgDeleteForm, clearOrgDeleteForm, deleteOrg } from './orgStore';

const OrgDeleteModal = ({ onSuccess, onError }) => {
  const isDisplayed = useSelector((state) => state.org.delete.isDisplayed);
  const record = useSelector((state) => state.org.delete.record);
  const isDeletePending = useSelector((state) => state.org.delete.isDeletePending);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearOrgDeleteForm());
    dispatch(hideOrgDeleteForm());
  }, [dispatch]);

  const onDelete = React.useCallback(() => {
    dispatch(deleteOrg({ id: record.id })).then((isOrgDeleted) => {
      if (isOrgDeleted) {
        dispatch(clearOrgDeleteForm());
        dispatch(hideOrgDeleteForm());
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

OrgDeleteModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

OrgDeleteModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default OrgDeleteModal;
