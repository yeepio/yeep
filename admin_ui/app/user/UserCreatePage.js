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

      {/* <fieldset className="mb-6">
        <legend>User details</legend>
        <div className="form-group mb-4">
          <label htmlFor="user-full-name">Full name:</label>
          <Input
            id="user-full-name"
            placeholder="enter your full name"
            className="w-full sm:w-1/2"
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-username">Username:</label>
          <Input id="user-username" placeholder="enter your username" className="w-full sm:w-1/2" />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-email">
            <strong>Primary</strong> email:
          </label>
          <Input
            id="user-email"
            type="email"
            placeholder="name@domain.com"
            className="w-full sm:w-1/2"
          />
        </div>
        <div className="form-group mb-4">
          <label htmlFor="user-password">Password:</label>
          <Input id="user-password" type="password" className="w-full sm:w-1/2" />
        </div>
        <div className="form-group">
          <label htmlFor="user-verify-password">Verify password:</label>
          <Input id="user-verify-password" type="password" className="w-full sm:w-1/2" />
        </div>
      </fieldset>
      <div className="sm:flex items-center">
        <Button className="w-full mb-2 sm:mb-0 sm:w-auto sm:mr-4">Save changes</Button>
        <span className="block text-center sm:text-left">
          {' '}
          or <Link to="/users">cancel and return to the list of users</Link>
        </span>
      </div> */}
    </React.Fragment>
  );
};

export default UserCreatePage;
