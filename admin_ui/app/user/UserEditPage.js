import React from 'react';
import PropTypes from 'prop-types';
import { Router } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import TabLinks from '../../components/TabLinks';
import { setUserUpdateRecord, clearUserUpdateForm } from './userStore';
import yeepClient from '../yeepClient';
import LoadingIndicator from '../../components/LoadingIndicator';
import UserEditProfileTab from './UserEditProfileTab';
import UserDeleteModal from './UserDeleteModal';
import { gotoUserListPage } from './userURL';

function getUserInfo({ id }) {
  return yeepClient
    .api()
    .then((api) =>
      api.user.info({
        id,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getUserInfo),
      })
    )
    .then((data) => data.user);
}

const UserEditPage = ({ userId }) => {
  const records = useSelector((state) => state.user.list.records);
  const record = useSelector((state) => state.user.update.record);

  const dispatch = useDispatch();

  React.useEffect(() => {
    // check if user info already exists in store
    const user = find(records, (e) => e.id === userId);

    if (user) {
      dispatch(setUserUpdateRecord(user));
    } else {
      // org does not exist in memory - retrieve from API
      getUserInfo({ id: userId })
        .then((user) => {
          dispatch(setUserUpdateRecord(user));
        })
        .catch((err) => {
          console.error(err);
        });
    }

    return () => {
      yeepClient.redeemCancelToken(getUserInfo);
      dispatch(clearUserUpdateForm());
    };
  }, [userId, records, dispatch]);

  useDocumentTitle(`Edit user ${userId}`);

  if (record.id == null) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <UserDeleteModal onSuccess={gotoUserListPage} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit user &quot;{record.fullName}&quot;</h1>
      <TabLinks
        className="mb-6"
        links={[
          {
            label: 'User details',
            to: `/users/${userId}/edit`,
          },
          {
            label: 'Organization membership',
            to: `/users/${userId}/edit/memberships`,
          },
          {
            label: 'System permissions',
            to: `/users/${userId}/edit/system-permissions`,
          },
        ]}
      />
      <Router>
        <UserEditProfileTab path="/" />
        {/* <OrgEditPermissionsTab path="/permissions" />
        <OrgEditRolesTab path="/roles" /> */}
      </Router>
    </React.Fragment>
  );
};

UserEditPage.propTypes = {
  userId: PropTypes.string,
};

export default UserEditPage;
