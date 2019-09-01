import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import RoleDeleteModal from './RoleDeleteModal';
import RoleForm from './RoleForm';
import { updateRole, getRoleInfo, setRoleFormValues, openRoleDeleteModal } from './roleStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';

function gotoRoleList() {
  navigate('/roles');
}

const RoleEditPage = ({ roleId }) => {
  const records = useSelector((state) => state.role.list.records);
  const isLoading = useSelector((state) => state.role.form.isLoading);
  const dispatch = useDispatch();

  useDocumentTitle(`Edit role#${roleId}`);

  useEffect(() => {
    // check if role info already exists in store
    const role = find(records, (e) => e.id === roleId);

    if (role) {
      dispatch(setRoleFormValues(role));
    } else {
      // role does not exist in memory - retrieve from API
      dispatch(getRoleInfo({ id: roleId })).then((role) => {
        dispatch(setRoleFormValues(role));
      });
    }

    return () => {
      yeepClient.redeemCancelToken(getRoleInfo);
    };
  }, [roleId, records, dispatch]);

  const onRoleDelete = useCallback(
    (values) => {
      dispatch(
        openRoleDeleteModal({
          role: {
            id: roleId,
            ...values,
          },
        })
      );
    },
    [dispatch, roleId]
  );

  const submitForm = useCallback(
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
          gotoRoleList();
        }
      });
    },
    [dispatch, roleId]
  );

  return (
    <React.Fragment>
      <RoleDeleteModal onSuccess={gotoRoleList} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit role #{roleId}</h1>
      {isLoading == null ? (
        <LoadingIndicator />
      ) : (
        <RoleForm
          type="update"
          onCancel={gotoRoleList}
          onSubmit={submitForm}
          onDelete={onRoleDelete}
        />
      )}
      <Link to="/roles">Return to the list of roles</Link>
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
