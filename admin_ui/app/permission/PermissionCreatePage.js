import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import PermissionForm from './PermissionForm';
import { createPermission } from './permissionStore';
import { gotoPermissionListPage } from './permissionURL';

const PermissionCreatePage = () => {
  const errors = useSelector((state) => state.permission.create.errors);
  const isSavePending = useSelector((state) => state.permission.create.isSavePending);

  const dispatch = useDispatch();

  const onSubmit = React.useCallback(
    (values) => {
      dispatch(
        createPermission({
          name: values.name,
          description: values.description,
          scope: values.org ? values.org.id : null,
        })
      ).then((isPermissionCreated) => {
        if (isPermissionCreated) {
          gotoPermissionListPage();
        }
      });
    },
    [dispatch]
  );

  useDocumentTitle('Create permission');

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new permission</h1>
      <PermissionForm
        errors={errors}
        isSavePending={isSavePending}
        onCancel={gotoPermissionListPage}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
};

export default PermissionCreatePage;
