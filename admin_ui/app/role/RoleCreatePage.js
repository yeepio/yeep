import React, { useCallback } from 'react';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import RoleForm from './RoleForm';
import { createRole } from './roleStore';

function gotoRoleList() {
  navigate('/roles');
}

const RoleCreatePage = () => {
  const dispatch = useDispatch();

  const onSubmit = useCallback(
    (values) => {
      dispatch(createRole(values)).then(() => {
        gotoRoleList();
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
