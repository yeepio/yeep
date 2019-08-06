import React, { useCallback, useEffect } from 'react';
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
  const isPermissionListLoading = useSelector((state) => state.permission.isPermissionListLoading);
  const permissionData = useSelector((state) => state.permission.permissions);
  const permissionCount = useSelector((state) => state.permission.permissionCount);
  const permissionListLimit = useSelector((state) => state.permission.permissionListLimit);
  const permissionListFilters = useSelector((state) => state.permission.filters);
  const currentPage = useSelector((state) => state.permission.page);

  useDocumentTitle('Permissions');

  const dispatch = useDispatch();

  const entitiesStart = currentPage * permissionListLimit + 1;
  const entitiesEnd =
    permissionData.length >= permissionListLimit ? (currentPage + 1) * permissionListLimit : permissionData.length;

  useEffect(() => {
    dispatch(listPermissions());
  }, [dispatch, permissionListLimit, currentPage, permissionListFilters]);

  const reload = useCallback(() => {
    dispatch(listPermissions());
  }, [dispatch]);

  const handleDelete = useCallback(
    (permission) => {
      dispatch(openPermissionDeleteModal({ permission }));
    },
    [dispatch]
  );

  const handleNext = useCallback(() => {
    dispatch(setPermissionListPage({ page: currentPage + 1 }));
  }, [dispatch, currentPage]);

  const handlePrevious = useCallback(() => {
    dispatch(setPermissionListPage({ page: currentPage - 1 }));
  }, [dispatch, currentPage]);

  const handleLimitChange = useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setPermissionListLimit({ limit: newLimit }));
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

  const throttledHandleSearch = useCallback(
    throttle((searchTerm) => {
      dispatch(setPermissionListFilters({ queryText: searchTerm }));
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
      <PermissionDeleteModal onSuccess={reload} onError={(err) => console.error(err)} />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Permissions</h1>
      <fieldset className="mb-6">
        <legend>Filters and quick search</legend>
        <div className="sm:flex items-center">
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All roles"
            options={[
              { value: 1, label: 'Role 1' },
              { value: 2, label: 'Role 2' },
              { value: 3, label: 'Role 3' },
              { value: 4, label: 'Role 4' },
            ]}
            isClearable={true}
          />
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
          <label
            htmlFor="showSystemPermissions"
            className="block flex-initial mb-3 sm:mb-0 sm:mr-3"
          >
            <input type="checkbox" id="showSystemPermissions" className="mr-2" onChange={handleSystemPermissionFilter} />
            Show system permissions
          </label>
          <Input placeholder="quicksearch" className="w-full sm:w-1/4" onKeyUp={handleSearch} />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={permissionHeadings}
        data={permissionData}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={permissionCount}
        hasNext={permissionData.length >= permissionListLimit}
        hasPrevious={currentPage > 0}
        onNextClick={handleNext}
        onPreviousClick={handlePrevious}
        onLimitChange={handleLimitChange}
        isLoading={isPermissionListLoading}
        renderer={(permissionData, index) => {
          return (
            <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${permissionData.id}/edit`}>{permissionData.name}</Link>
              </td>
              <td className="p-2 text-center">{permissionData.isSystemPermission ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{permissionData.rolesCount}</td>
              <td className="p-2 text-center">
                {permissionData.orgScope ? permissionData.orgScope.orgLabel : '-'}
              </td>
              <td className="p-2 text-center">
                {!permissionData.isSystemPermission && (
                  <React.Fragment>
                    <Link to={`${permissionData.id}/edit`}>Edit</Link>{' '}
                    <button onClick={() => handleDelete(permissionData)} className="pseudolink">
                      Delete
                    </button>
                  </React.Fragment>
                )}
                {permissionData.isSystemPermission && <span className="text-grey">Cannot modify</span>}
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
