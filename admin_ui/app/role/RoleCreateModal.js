import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { useSelector, useDispatch } from 'react-redux';
import { clearRoleCreateForm, hideRoleCreateForm, createRole } from './roleStore';
import RoleForm from './RoleForm';
import Modal from '../../components/Modal';

const RoleCreateModal = ({ onSuccess, onError, org }) => {
  const errors = useSelector((state) => state.role.create.errors);
  const isSavePending = useSelector((state) => state.role.create.isSavePending);
  const isDisplayed = useSelector((state) => state.role.create.isDisplayed);

  const dispatch = useDispatch();

  const onDismiss = React.useCallback(() => {
    dispatch(clearRoleCreateForm());
    dispatch(hideRoleCreateForm());
  }, [dispatch]);

  const submitForm = React.useCallback(
    (values) => {
      dispatch(
        createRole({
          name: values.name,
          description: values.description,
          scope: values.org ? values.org.id : null,
        })
      ).then((isRoleCreated) => {
        if (isRoleCreated) {
          dispatch(clearRoleCreateForm());
          dispatch(hideRoleCreateForm());
          onSuccess();
        } else {
          onError();
        }
      });
    },
    [dispatch, onError, onSuccess]
  );

  // Create an empty record that we'll pass to <Roleform>
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
    <Modal onClose={onDismiss}>
      <h1 className="font-semibold text-3xl mb-6">Create Role</h1>
      <RoleForm
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

RoleCreateModal.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  org: PropTypes.object
};

RoleCreateModal.defaultProps = {
  onSuccess: noop,
  onError: noop,
};

export default RoleCreateModal;
