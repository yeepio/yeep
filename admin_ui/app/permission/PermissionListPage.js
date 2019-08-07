import React, { useCallback, useEffect, useMemo } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import throttle from 'lodash/throttle';
import Select from 'react-select';
import Grid from '../../components/Grid';
import Input from '../../components/Input';
import PermissionDeleteModal from '../modals/PermissionDeleteModal';
import { openPermissionDeleteModal } from '../modals/permissionModalsStore';
import {
  listPermissions,
  setPermissionListLimit,
  setPermissionListPage,
  setPermissionListFilters,
} from './permissionStore';
import PermissionListFilters from './PermissionListFilters';

// Dummy data
const permissionHeadings = [
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
  const isLoading = useSelector((state) => state.permission.isPermissionListLoading);
  const permissions = useSelector((state) => state.permission.permissions);
  const totalCount = useSelector((state) => state.permission.permissionCount);
  const limit = useSelector((state) => state.permission.limit);
  const filters = useSelector((state) => state.permission.filters);
  const currentPage = useSelector((state) => state.permission.page);

  useDocumentTitle('Permissions');

  const dispatch = useDispatch();

  const entitiesStart = useMemo(() => {
    return currentPage * limit + 1;
  }, [currentPage, limit]);

  const entitiesEnd = useMemo(() => {
    return permissions.length >= limit ? (currentPage + 1) * limit : permissions.length;
  }, [currentPage, limit, permissions]);

  useEffect(() => {
    dispatch(listPermissions());
  }, [dispatch, limit, currentPage, filters]);

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
    dispatch(setPermissionListPage({ page: currentPage + 1 }));
  }, [dispatch, currentPage]);

  const onPagePrevious = useCallback(() => {
    dispatch(setPermissionListPage({ page: currentPage - 1 }));
  }, [dispatch, currentPage]);

  const onLimitChange = useCallback(
    (event) => {
      const nextLimit = event.value;
      dispatch(setPermissionListLimit({ limit: nextLimit }));
    },
    [dispatch]
  );

  const handleSystemPermissionFilter = useCallback(
    (event) => {
      const { checked } = event.target;
      dispatch(setPermissionListFilters({ isSystemPermission: checked }));
    },
    [dispatch]
  );

  const throttledSearch = useCallback(
    throttle((searchTerm) => {
      dispatch(setPermissionListFilters({ queryText: searchTerm }));
    }, 600),
    [dispatch]
  );

  const onSearch = useCallback(
    (event) => {
      const searchTerm = event.target.value;
      throttledSearch(searchTerm);
    },
    [throttledSearch]
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
        headings={permissionHeadings}
        data={permissions}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={permissions.length >= limit}
        hasPrevious={currentPage > 0}
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
        <Link to="..">Return to dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default PermissionListPage;
