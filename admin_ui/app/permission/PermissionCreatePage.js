import React from 'react';
import { navigate } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import PermissionForm from './PermissionForm';
import { createPermission, resetPermissionFormValues } from './permissionStore';

function gotoPermissionListPage() {
  navigate('/permissions');
}

const PermissionCreatePage = () => {
  const errors = useSelector((state) => state.permission.form.errors);
  const isSavePending = useSelector((state) => state.permission.form.isSavePending);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(resetPermissionFormValues());
  }, [dispatch]);

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
