import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import RoleForm from './RoleForm';
import { updateRole, getRoleInfo } from './roleStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';

function gotoRoleList() {
  navigate('/roles');
}

const RoleEditPage = ({ roleId }) => {
  const [editedRole, setEditedRole] = useState(null);
  const roles = useSelector((state) => state.role.roles);
  const dispatch = useDispatch();

  useDocumentTitle(`Edit role#${roleId}`);

  useEffect(() => {
    // check if role info already exists in store
    const role = find(roles, (role) => role.id === roleId);

    if (role) {
      setEditedRole(role);
    } else {
      // role does not exist in memory - retrieve from API
      dispatch(getRoleInfo({ id: roleId })).then((role) => {
        setEditedRole(role);
      });
    }

    return () => {
      yeepClient.redeemCancelToken(getRoleInfo);
    };
  }, [roleId, roles, setEditedRole, dispatch]);

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
      ).then(() => {
        gotoRoleList();
      });
    },
    [dispatch, roleId]
  );

  return (
    <React.Fragment>
      <RoleDeleteModal onSuccess={gotoRoleList} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit role #{roleId}</h1>
      {editedRole == null ? (
        <LoadingIndicator />
      ) : (
        <RoleForm
          onCancel={gotoRoleList}
          onSubmit={submitForm}
          onDelete={onRoleDelete}
          defaultValues={editedRole}
          withDangerZone
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
