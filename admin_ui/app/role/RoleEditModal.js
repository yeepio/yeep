import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import { clearRoleUpdateForm, updateRole, hideRoleUpdateForm } from './roleStore';
import RoleForm from './RoleForm';
import Modal from '../../components/Modal';

const RoleEditModal = ({ onSuccess, onError }) => {
  const errors = useSelector((state) => state.role.update.errors);
  const record = useSelector((state) => state.role.update.record);
  const isSavePending = useSelector((state) => state.role.update.isSavePending);
  const isDisplayed = useSelector((state) => state.role.update.isDisplayed);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearRoleUpdateForm());
    dispatch(hideRoleUpdateForm());
  }, [dispatch]);

  const submitForm = React.useCallback(
    (values) => {
      dispatch(
        updateRole({
          id: values.id,
          name: values.name,
          description: values.description,
          permissions: values.permissions.map((e) => e.id),
        })
      ).then((isRoleUpdated) => {
        if (isRoleUpdated) {
          dispatch(clearRoleUpdateForm());
          dispatch(hideRoleUpdateForm());
          onSuccess();
        } else {
          onError();
        }
      });
    },
    [dispatch, onError, onSuccess]
  );

  if (record.id == null || !isDisplayed) {
    return null;
  }

  return (
    <Modal onClose={onDismiss}>
      <h1 className="font-semibold text-3xl mb-6">Edit role {record.name}</h1>
      <RoleForm
        defaultValues={record}
        isSavePending={isSavePending}
        errors={errors}
        onCancel={onDismiss}
        onSubmit={submitForm}
      />
    </Modal>
  );
};

RoleEditModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

RoleEditModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default RoleEditModal;
