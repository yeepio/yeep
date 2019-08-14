import React, { useCallback, useEffect } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import Grid from '../../components/Grid';
import PermissionDeleteModal from './PermissionDeleteModal';
import {
  listPermissions,
  setPermissionListLimit,
  setPermissionListPage,
  openPermissionDeleteModal,
} from './permissionStore';
import yeepClient from '../yeepClient';
import PermissionListFilters from './PermissionListFilters';

const headings = [
  {
    label: 'Name',
    className: 'text-left',
    isSortable: false,
  },
  { label: 'System permission', isSortable: false },
  { label: 'Role assignments', isSortable: false },
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const PermissionListPage = () => {
  const isLoading = useSelector((state) => state.permission.list.isLoading);
  const records = useSelector((state) => state.permission.list.records);
  const totalCount = useSelector((state) => state.permission.list.totalCount);
  const limit = useSelector((state) => state.permission.list.limit);
  const filters = useSelector((state) => state.permission.list.filters);
  const page = useSelector((state) => state.permission.list.page);

  useDocumentTitle('Permissions');

  const dispatch = useDispatch();

  const entitiesStart = page * limit + 1;
  const entitiesEnd = records.length >= limit ? (page + 1) * limit : records.length;

  useEffect(() => {
    dispatch(listPermissions());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listPermissions);
    };
  }, [dispatch, limit, page, filters]);

  const reload = useCallback(() => {
    dispatch(listPermissions());
  }, [dispatch]);

  const onPermissionDelete = useCallback(
    (permission) => {
      dispatch(openPermissionDeleteModal({ permission }));
    },
    [dispatch]
  );

  const onPageNext = useCallback(() => {
    dispatch(setPermissionListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = useCallback(() => {
    dispatch(setPermissionListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setPermissionListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <PermissionDeleteModal onSuccess={reload} onError={(err) => console.error(err)} />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Permissions</h1>
      <PermissionListFilters />
      <Grid
        className="mb-6"
        headings={headings}
        data={records}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={records.length >= limit}
        hasPrevious={page > 0}
        onNextClick={onPageNext}
        onPreviousClick={onPagePrevious}
        onLimitChange={onLimitChange}
        isLoading={isLoading}
        renderer={(permission, index) => {
          return (
            <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${permission.id}/edit`}>{permission.name}</Link>
              </td>
              <td className="p-2 text-center">{permission.isSystemPermission ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{permission.rolesCount}</td>
              <td className="p-2 text-center">
                {permission.orgScope ? permission.orgScope.orgLabel : '-'}
              </td>
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
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default PermissionListPage;
