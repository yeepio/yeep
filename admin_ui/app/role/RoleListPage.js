import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import RoleDeleteModal from './RoleDeleteModal';
import {
  listRoles,
  setRoleListLimit,
  setRoleListPage,
  setRoleDeleteRecord,
  showRoleDeleteForm,
} from './roleStore';
import RoleListFilters from './RoleListFilters';
import RoleGrid from './RoleGrid';
import yeepClient from '../yeepClient';

const RoleListPage = () => {
  const isLoading = useSelector((state) => state.role.list.isLoading);
  const records = useSelector((state) => state.role.list.records);
  const totalCount = useSelector((state) => state.role.list.totalCount);
  const limit = useSelector((state) => state.role.list.limit);
  const filters = useSelector((state) => state.role.list.filters);
  const currentPage = useSelector((state) => state.role.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listRoles());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listRoles);
    };
  }, [dispatch, limit, currentPage, filters]);

  const reload = React.useCallback(() => {
    dispatch(listRoles());
  }, [dispatch]);

  const onRoleDelete = React.useCallback(
    (role) => {
      dispatch(setRoleDeleteRecord(role));
      dispatch(showRoleDeleteForm());
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setRoleListPage({ page: currentPage + 1 }));
  }, [dispatch, currentPage]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setRoleListPage({ page: currentPage - 1 }));
  }, [dispatch, currentPage]);

  const onLimitChange = React.useCallback(
    (event) => {
      const nextLimit = event.value;
      dispatch(setRoleListLimit({ limit: nextLimit }));
    },
    [dispatch]
  );

  useDocumentTitle('Roles');

  return (
    <React.Fragment>
      <RoleDeleteModal onSuccess={reload} onError={(err) => console.error(err)} />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Roles</h1>
      <RoleListFilters />
      <RoleGrid
        className="mb-6"
        isLoading={isLoading}
        records={records}
        totalCount={totalCount}
        page={currentPage}
        pageSize={limit}
        onPageNext={onPageNext}
        onPagePrevious={onPagePrevious}
        onLimitChange={onLimitChange}
        getRecordEditLink={(record) => `${record.id}/edit`}
        onRecordDelete={onRoleDelete}
      />
      <p>
        <Link to="..">Return to dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default RoleListPage;
