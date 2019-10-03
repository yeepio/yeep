import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import {
  listUsers,
  setUserListPage,
  setUserListLimit,
  showUserDeleteForm,
  setUserDeleteRecord,
} from './userStore';
import yeepClient from '../yeepClient';
// import UserDeleteModal from './UserDeleteModal';
import UserListFilters from './UserListFilters';
import UserGrid from './UserGrid';

const UserListPage = () => {
  const isLoading = useSelector((state) => state.user.list.isLoading);
  const records = useSelector((state) => state.user.list.records);
  const totalCount = useSelector((state) => state.user.list.totalCount);
  const limit = useSelector((state) => state.user.list.limit);
  const filters = useSelector((state) => state.user.list.filters);
  const page = useSelector((state) => state.user.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listUsers());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listUsers);
    };
  }, [dispatch, limit, page, filters]);

  const reload = React.useCallback(() => {
    dispatch(listUsers());
  }, [dispatch]);

  const onUserDelete = React.useCallback(
    (user) => {
      dispatch(setUserDeleteRecord(user));
      dispatch(showUserDeleteForm());
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setUserListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setUserListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setUserListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  useDocumentTitle('Users');

  return (
    <React.Fragment>
      {/* <UserDeleteModal onSuccess={reload} onError={(err) => console.error(err)} /> */}
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="mb-6 font-semibold text-3xl">Users</h1>
      <UserListFilters />
      <UserGrid
        className="mb-6"
        isLoading={isLoading}
        records={records}
        totalCount={totalCount}
        page={page}
        pageSize={limit}
        onPageNext={onPageNext}
        onPagePrevious={onPagePrevious}
        onLimitChange={onLimitChange}
        getRecordEditLink={(record) => `${record.id}/edit`}
        onRecordDelete={onUserDelete}
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default UserListPage;
