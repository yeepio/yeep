import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import PermissionDeleteModal from './PermissionDeleteModal';
import PermissionForm from './PermissionForm';
import {
  updatePermission,
  setPermissionUpdateRecord,
  setPermissionDeleteRecord,
  showPermissionDeleteForm,
  clearPermissionUpdateForm,
} from './permissionStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';
import { gotoPermissionListPage } from './permissionLocationUtils';

function getPermissionInfo({ id }) {
  return yeepClient.api().then((api) =>
    api.permission.info({
      id,
      cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getPermissionInfo),
    })
  );
}

const PermissionEditPage = ({ permissionId }) => {
  const records = useSelector((state) => state.permission.list.records);
  const errors = useSelector((state) => state.permission.update.errors);
  const record = useSelector((state) => state.permission.update.record);
  const isSavePending = useSelector((state) => state.permission.update.isSavePending);

  const dispatch = useDispatch();

  useDocumentTitle(`Edit permission #${permissionId}`);

  React.useEffect(() => {
    // check if permission already exists in store
    const permission = find(records, (e) => e.id === permissionId);

    if (permission) {
      dispatch(setPermissionUpdateRecord(permission));
    } else {
      // permission does not exist in memory - retrieve from API
      getPermissionInfo({ id: permissionId })
        .then((data) => {
          dispatch(setPermissionUpdateRecord(data.permission));
        })
        .catch((err) => {
          console.error(err);
        });
    }

    return () => {
      yeepClient.redeemCancelToken(getPermissionInfo);
      dispatch(clearPermissionUpdateForm());
    };
  }, [permissionId, records, dispatch]);

  const onPermissionDelete = React.useCallback(
    (permission) => {
      dispatch(setPermissionDeleteRecord(permission));
      dispatch(showPermissionDeleteForm());
    },
    [dispatch]
  );

  const submitForm = React.useCallback(
    (nextValues) => {
      dispatch(
        updatePermission({
          id: nextValues.id,
          name: nextValues.name,
          description: nextValues.description,
        })
      ).then((isPermissionUpdated) => {
        if (isPermissionUpdated) {
          gotoPermissionListPage();
        }
      });
    },
    [dispatch]
  );

  if (record.id == null) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <PermissionDeleteModal onSuccess={gotoPermissionListPage} />
      <h1 className="font-semibold text-3xl mb-6">Edit permission #{permissionId}</h1>
      <PermissionForm
        defaultValues={record}
        isSavePending={isSavePending}
        errors={errors}
        onCancel={gotoPermissionListPage}
        onSubmit={submitForm}
        onDelete={onPermissionDelete}
      />
      <Link to="/permissions">Return to the list of permissions</Link>
    </React.Fragment>
  );
};

PermissionEditPage.propTypes = {
  permissionId: PropTypes.string,
};

export default PermissionEditPage;
