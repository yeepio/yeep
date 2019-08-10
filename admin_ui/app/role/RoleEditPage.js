import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import RoleForm from './RoleForm';
import { updateRole, getRoleInfo } from './roleStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';

const RoleEditPage = ({ roleId }) => {
  const [currentRole, setCurrentRole] = useState(null);
  const roles = useSelector((state) => state.role.roles);
  const dispatch = useDispatch();

  useDocumentTitle(`Edit role#${roleId}`);

  useEffect(() => {
    // check if role info already exists in store
    const role = find(roles, (role) => role.id === roleId);

    if (role) {
      setCurrentRole(role);
    } else {
      // role does not exist in memory - retrieve from API
      dispatch(getRoleInfo({ id: roleId })).then((role) => {
        setCurrentRole(role);
      });
    }

    return () => {
      yeepClient.redeemCancelToken(getRoleInfo);
    };
  }, [roleId, roles, setCurrentRole, dispatch]);

  const onRoleDelete = useCallback(
    (role) => {
      dispatch(openRoleDeleteModal({ role }));
    },
    [dispatch]
  );

  const gotoRoleList = useCallback(() => {
    navigate('/roles');
  }, []);

  const submitForm = useCallback(
    (values) => {
      dispatch(updateRole(values));
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <RoleDeleteModal onSuccess={gotoRoleList} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit role #{roleId}</h1>
      {currentRole == null ? (
        <LoadingIndicator />
      ) : (
        <RoleForm
          onCancel={gotoRoleList}
          onSubmit={submitForm}
          onDelete={onRoleDelete}
          defaultValues={currentRole}
          withDangerZone
        />
      )}
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
