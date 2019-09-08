import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import PermissionGrid from '../../components/PermissionGrid';
import PermissionDeleteModal from './PermissionDeleteModal';
import {
  listPermissions,
  setPermissionListLimit,
  setPermissionListPage,
  openPermissionDeleteModal,
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
      dispatch(openPermissionDeleteModal({ permission }));
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
      <PermissionDeleteModal onSuccess={reload} onError={(err) => console.error(err)} />
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
        limit={limit}
        onNextClick={onPageNext}
        onPreviousClick={onPagePrevious}
        onLimitChange={onLimitChange}
        getRecordEditLink={(record) => `${record.id}/edit`}
        onRecordDelete={onPermissionDelete}
      />
      {/* <Grid
        className="mb-6"
        headings={headings}
        data={records}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={records.length >= limit}
        hasPrevious={page > 0}
        renderer={(permission, index) => {
          return (
            <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${permission.id}/edit`}>{permission.name}</Link>
              </td>
              <td className="p-2 text-center">{permission.isSystemPermission ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{permission.roles.length}</td>
              <td className="p-2 text-center">{get(permission.org, ['name'], '-')}</td>
              <td className="p-2 text-center">
                {!permission.isSystemPermission && (
                  <React.Fragment>
                    <Link to={`${permission.id}/edit`}>Edit</Link>{' '}
                    <button onClick={() => onPermissionDelete(permission)} className="pseudolink">
                      Delete
                    </button>
                  </React.Fragment>
                )}
                {permission.isSystemPermission && <span className="text-grey">Cannot modify</span>}
              </td>
            </tr>
          );
        }}
      /> */}
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default PermissionListPage;
