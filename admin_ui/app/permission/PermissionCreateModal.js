import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import {
  clearPermissionCreateForm,
  hidePermissionCreateForm,
  createPermission,
} from './permissionStore';
import PermissionForm from './PermissionForm';
import Modal from '../../components/Modal';

const PermissionCreateModal = ({ onSuccess, onError, org }) => {

  const errors = useSelector((state) => state.permission.create.errors);
  const isSavePending = useSelector((state) => state.permission.create.isSavePending);
  const isDisplayed = useSelector((state) => state.permission.create.isDisplayed);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearPermissionCreateForm());
    dispatch(hidePermissionCreateForm());
  }, [dispatch]);

  const submitForm = React.useCallback(
    (values) => {
      dispatch(
        createPermission({
          name: values.name,
          description: values.description,
          scope: values.org ? values.org.id : null,
        })
      ).then((isPermissionCreated) => {
        if (isPermissionCreated) {
          dispatch(clearPermissionCreateForm());
          dispatch(hidePermissionCreateForm());
          onSuccess();
        } else {
          onError();
        }
      });
    },
    [dispatch, onError, onSuccess]
  );

  // Create an empty record that we'll pass to <PermissionForm>
  // via the default Values prop
  let record = {};

  if (!isDisplayed) {
    return null;
  } else {
    // We will display the modal. If an org was passed in via props,
    // send it down the line to <PermissionForm /> so that it shows that
    // org as preselected
    if (org.id) {
      record = {
        name: "",
        description: "",
        org
      };
    }
  }

  return (
    <Modal onClose={onDismiss} fullWidth={true}>
      <h1 className="font-semibold text-3xl mb-6">Create permission</h1>
      <PermissionForm
        isSavePending={isSavePending}
        errors={errors}
        onCancel={onDismiss}
        onSubmit={submitForm}
        defaultValues={record}
        lockOrgScope={true}
      />
    </Modal>
  );
};

PermissionCreateModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  org: PropTypes.object
};

PermissionCreateModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default PermissionCreateModal;
