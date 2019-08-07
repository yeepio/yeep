import React, { useCallback } from 'react';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import RoleForm from './RoleForm';
import { createRole } from './roleStore';

const RoleCreatePage = () => {
  const dispatch = useDispatch();

  const gotoRoleList = useCallback(() => {
    navigate('/roles');
  }, []);

  const submitForm = useCallback(
    (values) => {
      dispatch(createRole(values));
    },
    [dispatch]
  );

  useDocumentTitle('Create role');
  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new role</h1>
      <RoleForm onCancel={gotoRoleList} onSubmit={submitForm} />
    </React.Fragment>
  );
};

export default RoleCreatePage;
