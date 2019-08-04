import React, { useCallback, useEffect } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import last from 'lodash/last';
import dropRight from 'lodash/dropRight';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import pickBy from 'lodash/pickBy';
import throttle from 'lodash/throttle';
import ButtonLink from '../../components/ButtonLink';
import Grid from '../../components/Grid';
import Input from '../../components/Input';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import { listRoles, setRoleListLimit, setRoleListCursors, setRoleListFilters } from './roleStore';

// Dummy data
let roleHeadings = [
  { label: 'Role name', className: 'text-left', isSortable: false},
  { label: 'Permissions', isSortable: false},
  { label: 'System role?', isSortable: false},
  { label: 'Users', isSortable: false},
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const RoleListPage = () => {
  const isRoleListLoading = useSelector((state) => state.role.isRoleListLoading);
  const roleData = useSelector((state) => state.role.roles);
  const totalCount = useSelector((state) => state.role.totalCount);
  const roleListLimit = useSelector((state) => state.role.roleListLimit);
  const roleListCursors = useSelector((state) => state.role.cursors);
  const roleListFilters = useSelector((state) => state.role.filters);
  const nextCursor = useSelector((state) => state.role.nextCursor);
  // const loginErrors = useSelector((state) => state.session.loginErrors);

  const entitiesStart = (roleListCursors.length * roleListLimit )+ 1;
  const entitiesEnd = (roleListCursors.length + 1) * roleListLimit;
  const dispatch = useDispatch();

  useEffect(() => {
    const data = {
      limit: roleListLimit,
      cursor: last(roleListCursors),
      isSystemRole: roleListFilters.isSystemRole,
      // the API does not allow for empty strings as an input
      q: !isEmpty(roleListFilters.queryText) ? roleListFilters.queryText : undefined,
    };
    const sanitizedData = pickBy(data, value => !isUndefined(value));
    dispatch(listRoles(sanitizedData));
  }, [dispatch, roleListLimit, roleListCursors, roleListFilters]);

  useDocumentTitle('Roles');

  const handleDelete = useCallback(() => {
    dispatch(
      openRoleDeleteModal(
        {
          id: 1,
          name: 'role_name',
        },
        () => {
          console.log('Submit from roleDelete modal!');
        },
        () => {
          console.log('Cancel from roleDelete modal');
        }
      )
    );
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(setRoleListCursors({ cursors: [...roleListCursors, nextCursor] }));
  }, [dispatch, roleListLimit, roleListCursors, nextCursor]);

  const handlePrevious = useCallback(() => {
    const newCursors = dropRight(roleListCursors);
    dispatch(setRoleListCursors({ cursors: newCursors }));
  }, [dispatch, roleListLimit, roleListCursors, nextCursor]);

  const handleLimitChange = useCallback((event) => {
    const newLimit = event.value;
    // dispatch(setRoleListCursors({ cursors: [] })); // we can be explicit if we want
    dispatch(setRoleListLimit({ limit: newLimit }));
  }, [dispatch, roleListLimit, roleListCursors]);

  const handleSystemRoleFilter = useCallback((event) => {
    const { checked } = event.target;
    dispatch(setRoleListFilters({ isSystemRole: checked }));
  }, [dispatch]);

  const throttledHandleSearch = useCallback(throttle((searchTerm) => {
    dispatch(setRoleListFilters({ queryText: searchTerm }));
  }, 1000), [dispatch]);

  const handleSearch = useCallback((event) => {
    const searchTerm = event.target.value;
    throttledHandleSearch(searchTerm);
  }, [dispatch]);

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
            <input type="checkbox" id="showSystemRoles" className="mr-2" onChange={handleSystemRoleFilter} />
            Show system roles
          </label>
          <Input
            placeholder="quicksearch"
            className="w-full sm:w-1/3"
            onKeyUp={handleSearch}
          />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={roleHeadings}
        data={roleData}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={!!nextCursor}
        hasPrevious={roleListCursors.length > 0}
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
              <td className="p-2 text-center">
                {roleData.org ? roleData.org : '-'}
              </td>
              <td className="p-2 text-center">
                <Link to={`${roleData.id}/edit`}>Edit</Link>{' '}
                <button onClick={handleDelete} className="pseudolink">
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
