import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import PermissionDeleteModal from '../modals/PermissionDeleteModal';
import { openPermissionDeleteModal } from '../modals/permissionModalsStore';
import PermissionForm from './PermissionForm';
import { updatePermission, getPermissionInfo, setPermissionFormValues } from './permissionStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';

function gotoPermissionList() {
  navigate('/permissions');
}

const PermissionEditPage = ({ permissionId }) => {
  const records = useSelector((state) => state.permission.list.records);
  const isLoading = useSelector((state) => state.permission.form.isLoading);
  const dispatch = useDispatch();

  useDocumentTitle(`Edit permission #${permissionId}`);

  useEffect(() => {
    // check if permission already exists in store
    const permission = find(records, (e) => e.id === permissionId);

    if (permission) {
      dispatch(setPermissionFormValues(permission));
    } else {
      // role does not exist in memory - retrieve from API
      dispatch(getPermissionInfo({ id: permissionId })).then((permission) => {
        dispatch(setPermissionFormValues(permission));
      });
    }

    return () => {
      yeepClient.redeemCancelToken(getPermissionInfo);
    };
  }, [permissionId, records, dispatch]);

  const onPermissionDelete = useCallback(
    (values) => {
      dispatch(
        openPermissionDeleteModal({
          role: {
            id: permissionId,
            ...values,
          },
        })
      );
    },
    [dispatch, permissionId]
  );

  const submitForm = useCallback(
    (values) => {
      dispatch(
        updatePermission({
          id: permissionId,
          name: values.name,
          description: values.description,
        })
      ).then((isPermissionUpdated) => {
        if (isPermissionUpdated) {
          gotoPermissionList();
        }
      });
    },
    [dispatch, permissionId]
  );

  return (
    <React.Fragment>
      <PermissionDeleteModal onSuccess={gotoPermissionList} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit permission #{permissionId}</h1>
      {isLoading == null ? (
        <LoadingIndicator />
      ) : (
        <PermissionForm
          type="update"
          onCancel={gotoPermissionList}
          onSubmit={submitForm}
          onDelete={onPermissionDelete}
        />
      )}
    </React.Fragment>
  );
};

PermissionEditPage.propTypes = {
  permissionId: PropTypes.string.isRequired,
};

export default PermissionEditPage;
