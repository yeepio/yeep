import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import { createUser } from './userStore';
import { gotoUserListPage } from './userURL';
import UserCreateForm from './UserCreateForm';

const UserCreatePage = () => {
  const errors = useSelector((state) => state.org.create.errors);
  const isSavePending = useSelector((state) => state.org.create.isSavePending);

  const dispatch = useDispatch();

  const onSubmit = React.useCallback(
    (values) => {
      dispatch(
        createUser({
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          // picture: values.picture,
          emails: values.emails,
        })
      ).then((isUserCreated) => {
        if (isUserCreated) {
          gotoUserListPage();
        }
      });
    },
    [dispatch]
  );

  useDocumentTitle('Create user');

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new user</h1>
      <UserCreateForm
        errors={errors}
        isSavePending={isSavePending}
        onCancel={gotoUserListPage}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
};

export default UserCreatePage;
