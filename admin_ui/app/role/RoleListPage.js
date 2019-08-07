import React, { useCallback, useEffect, useMemo } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import Grid from '../../components/Grid';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import { listRoles, setRoleListLimit, setRoleListPage } from './roleStore';
import RoleListFilters from './RoleListFilters';

// Dummy data
let roleHeadings = [
  { label: 'Role name', className: 'text-left', isSortable: false },
  { label: 'Permissions', isSortable: false },
  { label: 'System role?', isSortable: false },
  { label: 'Users', isSortable: false },
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const RoleListPage = () => {
  const isLoading = useSelector((state) => state.role.isRoleListLoading);
  const roles = useSelector((state) => state.role.roles);
  const totalCount = useSelector((state) => state.role.roleCount);
  const limit = useSelector((state) => state.role.limit);
  const filters = useSelector((state) => state.role.filters);
  const currentPage = useSelector((state) => state.role.page);

  const entitiesStart = useMemo(() => {
    return currentPage * limit + 1;
  }, [currentPage, limit]);
  const entitiesEnd = useMemo(() => {
    return roles.length >= limit ? (currentPage + 1) * limit : roles.length;
  }, [currentPage, limit, roles]);

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
        headings={roleHeadings}
        data={roles}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={roles.length >= limit}
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
              <td className="p-2 text-center">{role.usersCount}</td>
              <td className="p-2 text-center">{role.org ? role.org : '-'}</td>
              <td className="p-2 text-center">
                <Link to={`${role.id}/edit`}>Edit</Link>{' '}
                <button onClick={() => onRoleDelete(role)} className="pseudolink">
                  Delete
                </button>
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
