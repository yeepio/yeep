import React, { useCallback, useEffect } from 'react';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import RoleForm from './RoleForm';
import { createRole, resetRoleFormValues } from './roleStore';

function gotoRoleList() {
  navigate('/roles');
}

const RoleCreatePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetRoleFormValues());
  }, [dispatch]);

  const onSubmit = useCallback(
    (values) => {
      dispatch(
        createRole({
          name: values.name,
          description: values.description,
          scope: values.org ? values.org.id : null,
          permissions:
            values.permissions.length !== 0
              ? values.permissions.map((permission) => permission.id)
              : null,
        })
      ).then((isPermissionCreated) => {
        if (isPermissionCreated) {
          gotoRoleList();
        }
      });
    },
    [dispatch]
  );

  useDocumentTitle('Create role');

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new role</h1>
      <RoleForm onCancel={gotoRoleList} onSubmit={onSubmit} />
    </React.Fragment>
  );
};

export default RoleCreatePage;
