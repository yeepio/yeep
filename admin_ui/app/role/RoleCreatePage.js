import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import RoleForm from './RoleForm';
import { createRole } from './roleStore';
import { gotoRoleListPage } from './roleURL';

const RoleCreatePage = () => {
  const errors = useSelector((state) => state.permission.create.errors);
  const isSavePending = useSelector((state) => state.permission.create.isSavePending);

  const dispatch = useDispatch();

  const onSubmit = React.useCallback(
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
          gotoRoleListPage();
        }
      });
    },
    [dispatch]
  );

  useDocumentTitle('Create role');

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new role</h1>
      <RoleForm
        errors={errors}
        isSavePending={isSavePending}
        onCancel={gotoRoleListPage}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
};

export default RoleCreatePage;
