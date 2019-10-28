import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import { setUserDeleteRecord, showUserDeleteForm, updateUser } from './userStore';
import { gotoUserListPage } from './userURL';
import UserForm from './UserForm';

const UserEditProfileTab = () => {
  const record = useSelector((state) => state.user.update.record);
  const errors = useSelector((state) => state.user.update.errors);
  const isSavePending = useSelector((state) => state.user.update.isSavePending);

  const dispatch = useDispatch();

  const onUserDelete = React.useCallback(
    (org) => {
      dispatch(setUserDeleteRecord(org));
      dispatch(showUserDeleteForm());
    },
    [dispatch]
  );

  const submitForm = React.useCallback(
    (nextValues) => {
      dispatch(
        updateUser({
          id: nextValues.id,
          fullName: nextValues.fullName,
          username: nextValues.username,
          password: nextValues.password,
          emails: nextValues.emails,
        })
      ).then((isUserUpdated) => {
        if (isUserUpdated) {
          gotoUserListPage();
        }
      });
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <UserForm
        defaultValues={record}
        isSavePending={isSavePending}
        errors={errors}
        onSubmit={submitForm}
      />
      <fieldset className="mb-6">
        <legend>Profile picture</legend>
        <div className="sm:flex mb-4">
          <div className="sm:w-1/4">Picture srouce:</div>
          <div className="sm:w-3/4">
            <label htmlFor="user-pic-source-none" className="block">
              <input
                type="radio"
                name="user-pic-source"
                id="user-pic-source-none"
                className="mr-2"
              />{' '}
              No uploaded picture (will use <a href="#top">your Gravatar</a> if set)
            </label>
            <label htmlFor="user-pic-source-custom" className="block">
              <input
                type="radio"
                name="user-pic-source"
                id="user-pic-source-custom"
                className="mr-2"
                checked="checked"
              />{' '}
              Upload my own profile picture
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="user-pic-upload">Current picture:</label>
          <div className="sm:w-3/4">
            <div className="mb-3">
              <div className="inline-block p-2 border border-grey">
                <img
                  src="/temp-user-pic.jpg"
                  width="120"
                  height="120"
                  alt="User profile"
                  className="block"
                />
              </div>
            </div>
            <div className="mb-3">
              <Button className="w-full sm:w-auto">Upload a new profile pic</Button>
            </div>
            <div className="text-sm text-grey-dark">
              Save as a PNG, JPG or WEBP
              <br />
              Minimum size of height or width: 200px
              <br />
              Maximum size of height or width: 1000px
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Danger zone</legend>
        <Button danger={true} className="mr-4">
          Delete user
        </Button>
        <Button>Deactivate user</Button>
      </fieldset>
      <div>
        <Link to="/users">Return to the list of users</Link>
      </div>
    </React.Fragment>
  );
};

UserEditProfileTab.propTypes = {
  userId: PropTypes.string,
};

export default UserEditProfileTab;
