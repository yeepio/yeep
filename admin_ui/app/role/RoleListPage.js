import React, { useCallback, useEffect, useMemo } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import get from 'lodash/get';
import ButtonLink from '../../components/ButtonLink';
import Grid from '../../components/Grid';
import RoleDeleteModal from './RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import { listRoles, setRoleListLimit, setRoleListPage } from './roleStore';
import RoleListFilters from './RoleListFilters';

const headings = [
  { label: 'Role name', className: 'text-left', isSortable: false },
  { label: 'Permissions', isSortable: false },
  { label: 'System role?', isSortable: false },
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const RoleListPage = () => {
  const isLoading = useSelector((state) => state.role.list.isLoading);
  const records = useSelector((state) => state.role.list.records);
  const totalCount = useSelector((state) => state.role.list.totalCount);
  const limit = useSelector((state) => state.role.list.limit);
  const filters = useSelector((state) => state.role.list.filters);
  const currentPage = useSelector((state) => state.role.list.page);

  const entitiesStart = useMemo(() => {
    return currentPage * limit + 1;
  }, [currentPage, limit]);
  const entitiesEnd = useMemo(() => {
    return records.length >= limit ? (currentPage + 1) * limit : records.length;
  }, [currentPage, limit, records]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listRoles());
  }, [dispatch, limit, currentPage, filters]);

  useDocumentTitle('Roles');

  const reload = useCallback(() => {
    dispatch(listRoles());
  }, [dispatch]);

  const onRoleDelete = useCallback(
    (role) => {
      dispatch(openRoleDeleteModal({ role }));
    },
    [dispatch]
  );

  const onPageNext = useCallback(() => {
    dispatch(setRoleListPage({ page: currentPage + 1 }));
  }, [dispatch, currentPage]);

  const onPagePrevious = useCallback(() => {
    dispatch(setRoleListPage({ page: currentPage - 1 }));
  }, [dispatch, currentPage]);

  const onLimitChange = useCallback(
    (event) => {
      const nextLimit = event.value;
      dispatch(setRoleListLimit({ limit: nextLimit }));
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <RoleDeleteModal onSuccess={reload} onError={(err) => console.error(err)} />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Roles</h1>
      <RoleListFilters />
      <Grid
        className="mb-6"
        headings={headings}
        data={records}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={records.length >= limit}
        hasPrevious={currentPage > 0}
        onNextClick={onPageNext}
        onPreviousClick={onPagePrevious}
        onLimitChange={onLimitChange}
        isLoading={isLoading}
        renderer={(role, index) => {
          return (
            <tr key={role.id} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${role.id}/edit`}>{role.name}</Link>
              </td>
              <td className="p-2 text-center">{role.permissions.length}</td>
              <td className="p-2 text-center">{role.isSystemRole ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{get(role.org, ['name'], '-')}</td>
              <td className="p-2 text-center">
                {role.isSystemRole ? (
                  <span className="text-grey">Cannot modify</span>
                ) : (
                  <React.Fragment>
                    <Link to={`${role.id}/edit`}>Edit</Link>{' '}
                    <button onClick={() => onRoleDelete(role)} className="pseudolink">
                      Delete
                    </button>
                  </React.Fragment>
                )}
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

export default RoleListPage;
