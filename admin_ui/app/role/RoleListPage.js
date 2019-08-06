import React, { useCallback, useEffect } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import throttle from 'lodash/throttle';
import ButtonLink from '../../components/ButtonLink';
import Grid from '../../components/Grid';
import Input from '../../components/Input';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import { listRoles, setRoleListLimit, setRoleListPage, setRoleListFilters } from './roleStore';

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
  const isRoleListLoading = useSelector((state) => state.role.isRoleListLoading);
  const roleData = useSelector((state) => state.role.roles);
  const roleCount = useSelector((state) => state.role.roleCount);
  const roleListLimit = useSelector((state) => state.role.roleListLimit);
  const roleListCursors = useSelector((state) => state.role.cursors);
  const roleListFilters = useSelector((state) => state.role.filters);
  const currentPage = useSelector((state) => state.role.page);
  // const loginErrors = useSelector((state) => state.session.loginErrors);

  const entitiesStart = currentPage * roleListLimit + 1;
  const entitiesEnd =
    roleData.length >= roleListLimit ? (currentPage + 1) * roleListLimit : roleData.length;
  const dispatch = useDispatch();

  useEffect(() => {
    const data = {
      limit: roleListLimit,
      cursor: roleListCursors[currentPage - 1],
      isSystemRole: roleListFilters.isSystemRole,
      // the API does not allow for empty strings as an input
      q: !isEmpty(roleListFilters.queryText) ? roleListFilters.queryText : undefined,
    };
    const sanitizedData = pickBy(data, (value) => !isUndefined(value));
    dispatch(listRoles(sanitizedData));
  }, [dispatch, roleListLimit, currentPage, roleListFilters]);

  useDocumentTitle('Roles');

  const handleDelete = useCallback(
    (roleData) => {
      dispatch(
        openRoleDeleteModal(
          roleData,
          () => {
            console.log('Submit from roleDelete modal!');
          },
          () => {
            console.log('Cancel from roleDelete modal');
          }
        )
      );
    },
    [dispatch]
  );

  const handleNext = useCallback(() => {
    dispatch(setRoleListPage({ page: currentPage + 1 }));
  }, [dispatch, currentPage]);

  const handlePrevious = useCallback(() => {
    dispatch(setRoleListPage({ page: currentPage - 1 }));
  }, [dispatch, currentPage]);

  const handleLimitChange = useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setRoleListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  const handleSystemRoleFilter = useCallback(
    (event) => {
      const { checked } = event.target;
      dispatch(setRoleListFilters({ isSystemRole: checked }));
    },
    [dispatch]
  );

  const throttledHandleSearch = useCallback(
    throttle((searchTerm) => {
      dispatch(setRoleListFilters({ queryText: searchTerm }));
    }, 600),
    [dispatch]
  );

  const handleSearch = useCallback(
    (event) => {
      const searchTerm = event.target.value;
      throttledHandleSearch(searchTerm);
    },
    [throttledHandleSearch]
  );

  return (
    <React.Fragment>
      <RoleDeleteModal />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Roles</h1>
      <fieldset className="mb-6">
        <legend>Filters and quick search</legend>
        <div className="sm:flex items-center">
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All organisations"
            options={[
              { value: 1, label: 'Org 1' },
              { value: 2, label: 'Org 2' },
              { value: 3, label: 'Org 3' },
              { value: 4, label: 'Org 4' },
            ]}
            isClearable={true}
          />
          <label htmlFor="showSystemRoles" className="block flex-initial mb-3 sm:mb-0 sm:mr-3">
            <input
              type="checkbox"
              id="showSystemRoles"
              className="mr-2"
              onChange={handleSystemRoleFilter}
            />
            Show system roles
          </label>
          <Input placeholder="quicksearch" className="w-full sm:w-1/3" onKeyUp={handleSearch} />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={roleHeadings}
        data={roleData}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={roleCount}
        hasNext={roleData.length >= roleListLimit}
        hasPrevious={currentPage > 0}
        onNextClick={handleNext}
        onPreviousClick={handlePrevious}
        onLimitChange={handleLimitChange}
        isLoading={isRoleListLoading}
        renderer={(roleData, index) => {
          return (
            <tr key={`roleRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${roleData.id}/edit`}>{roleData.name}</Link>
              </td>
              <td className="p-2 text-center">{roleData.permissions.length}</td>
              <td className="p-2 text-center">{roleData.isSystemRole ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{roleData.usersCount}</td>
              <td className="p-2 text-center">{roleData.org ? roleData.org : '-'}</td>
              <td className="p-2 text-center">
                <Link to={`${roleData.id}/edit`}>Edit</Link>{' '}
                <button onClick={() => handleDelete(roleData)} className="pseudolink">
                  Delete
                </button>
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

export default RoleListPage;
