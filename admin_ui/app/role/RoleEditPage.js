import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import RoleDeleteModal from './RoleDeleteModal';
import RoleForm from './RoleForm';
import {
  updateRole,
  setRoleUpdateRecord,
  clearRoleUpdateForm,
  setRoleDeleteRecord,
  showRoleDeleteForm,
} from './roleStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';
import { gotoRoleListPage } from './roleURL';

function getRoleInfo({ id }) {
  return yeepClient
    .api()
    .then((api) =>
      api.role.info({
        id,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getRoleInfo),
      })
    )
    .then((data) => data.role);
}

const RoleEditPage = ({ roleId }) => {
  const records = useSelector((state) => state.role.list.records);
  const errors = useSelector((state) => state.role.update.errors);
  const record = useSelector((state) => state.role.update.record);
  const isSavePending = useSelector((state) => state.role.update.isSavePending);

  const dispatch = useDispatch();

  useDocumentTitle(`Edit role #${roleId}`);

  React.useEffect(() => {
    // check if role info already exists in store
    const role = find(records, (e) => e.id === roleId);

    if (role) {
      dispatch(setRoleUpdateRecord(role));
    } else {
      // role does not exist in memory - retrieve from API
      getRoleInfo({ id: roleId }).then((role) => {
        dispatch(setRoleUpdateRecord(role));
      });
    }

    return () => {
      yeepClient.redeemCancelToken(getRoleInfo);
      dispatch(clearRoleUpdateForm());
    };
  }, [roleId, records, dispatch]);

  const onRoleDelete = React.useCallback(
    (role) => {
      dispatch(setRoleDeleteRecord(role));
      dispatch(showRoleDeleteForm());
    },
    [dispatch]
  );

  const submitForm = React.useCallback(
    (values) => {
      dispatch(
        updateRole({
          id: roleId,
          name: values.name,
          description: values.description,
          permissions: values.permissions.map((e) => e.id),
        })
      ).then((isRoleUpdated) => {
        if (isRoleUpdated) {
          gotoRoleListPage();
        }
      });
    },
    [dispatch, roleId]
  );

  if (record.id == null) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <RoleDeleteModal onSuccess={gotoRoleListPage} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit role #{roleId}</h1>
      <RoleForm
        defaultValues={record}
        isSavePending={isSavePending}
        errors={errors}
        onCancel={gotoRoleListPage}
        onSubmit={submitForm}
        onDelete={onRoleDelete}
      />
      <Link to="/roles">Return to the list of roles</Link>
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
