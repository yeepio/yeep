import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import PermissionGrid from './PermissionGrid';
import PermissionDeleteModal from './PermissionDeleteModal';
import {
  listPermissions,
  setPermissionListLimit,
  setPermissionListPage,
  setPermissionDeleteRecord,
  showPermissionDeleteForm,
} from './permissionStore';
import yeepClient from '../yeepClient';
import PermissionListFilters from './PermissionListFilters';

const PermissionListPage = () => {
  const isLoading = useSelector((state) => state.permission.list.isLoading);
  const records = useSelector((state) => state.permission.list.records);
  const totalCount = useSelector((state) => state.permission.list.totalCount);
  const limit = useSelector((state) => state.permission.list.limit);
  const filters = useSelector((state) => state.permission.list.filters);
  const page = useSelector((state) => state.permission.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listPermissions());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listPermissions);
    };
  }, [dispatch, limit, page, filters]);

  const reload = React.useCallback(() => {
    dispatch(listPermissions());
  }, [dispatch]);

  const onPermissionDelete = React.useCallback(
    (permission) => {
      dispatch(setPermissionDeleteRecord(permission));
      dispatch(showPermissionDeleteForm());
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setPermissionListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setPermissionListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setPermissionListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  useDocumentTitle('Permissions');

  return (
    <React.Fragment>
      <PermissionDeleteModal onSuccess={reload} />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Permissions</h1>
      <PermissionListFilters />
      <PermissionGrid
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
        onRecordDelete={onPermissionDelete}
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default PermissionListPage;
