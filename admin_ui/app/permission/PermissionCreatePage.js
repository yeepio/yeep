import React, { useCallback, useEffect } from 'react';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import RoleForm from './PermissionForm';
import { createPermission, resetPermissionFormValues } from './permissionStore';

function gotoPermissionList() {
  navigate('/permissions');
}

const RoleCreatePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetPermissionFormValues());
  }, [dispatch]);

  const onSubmit = useCallback(
    (values) => {
      dispatch(
        createPermission({
          name: values.name,
          description: values.description,
          scope: values.org ? values.org.id : null,
        })
      ).then((isPermissionCreated) => {
        if (isPermissionCreated) {
          gotoPermissionList();
        }
      });
    },
    [dispatch]
  );

  useDocumentTitle('Create permission');

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new permission</h1>
      <RoleForm onCancel={gotoPermissionList} onSubmit={onSubmit} />
    </React.Fragment>
  );
};

export default RoleCreatePage;
