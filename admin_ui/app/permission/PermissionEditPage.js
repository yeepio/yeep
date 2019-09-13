import React from 'react';
import PropTypes from 'prop-types';
import { Link, navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import PermissionDeleteModal from './PermissionDeleteModal';
import PermissionForm from '../../components/PermissionForm';
import {
  updatePermission,
  getPermissionInfo,
  setPermissionFormValues,
  openPermissionDeleteModal,
  resetPermissionFormValues,
} from './permissionStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';

function gotoPermissionListPage() {
  navigate('/permissions');
}

const PermissionEditPage = ({ permissionId }) => {
  const records = useSelector((state) => state.permission.list.records);
  const isLoading = useSelector((state) => state.permission.form.isLoading);
  const errors = useSelector((state) => state.permission.form.errors);
  const values = useSelector((state) => state.permission.form.values);
  const isSavePending = useSelector((state) => state.permission.form.isSavePending);

  const dispatch = useDispatch();

  useDocumentTitle(`Edit permission #${permissionId}`);

  React.useEffect(() => {
    // check if permission already exists in store
    const permission = find(records, (e) => e.id === permissionId);

    if (permission) {
      dispatch(setPermissionFormValues(permission));
    } else {
      // permission does not exist in memory - retrieve from API
      dispatch(getPermissionInfo({ id: permissionId })).then((permission) => {
        dispatch(setPermissionFormValues(permission));
      });
    }

    return () => {
      yeepClient.redeemCancelToken(getPermissionInfo);
      dispatch(resetPermissionFormValues());
    };
  }, [permissionId, records, dispatch]);

  const onPermissionDelete = React.useCallback(
    (permission) => {
      dispatch(openPermissionDeleteModal({ permission }));
    },
    [dispatch]
  );

  const submitForm = React.useCallback(
    (values) => {
      dispatch(
        updatePermission({
          id: values.id,
          name: values.name,
          description: values.description,
        })
      ).then((isPermissionUpdated) => {
        if (isPermissionUpdated) {
          gotoPermissionListPage();
        }
      });
    },
    [dispatch]
  );

  if (values.id == null || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <PermissionDeleteModal
        onSuccess={gotoPermissionListPage}
        onError={(err) => console.error(err)}
      />
      <h1 className="font-semibold text-3xl mb-6">Edit permission #{permissionId}</h1>
      <PermissionForm
        defaultValues={values}
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
