import React, { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import throttle from 'lodash/throttle';
import Input from '../../components/Input';
import { setPermissionListFilters } from './permissionStore';

const PermissionListFilters = () => {
  const filters = useSelector((state) => state.permission.filters);
  const dispatch = useDispatch();

  const onSystemPermissionFilterChange = useCallback(
    (event) => {
      dispatch(setPermissionListFilters({ isSystemPermission: event.target.checked }));
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
          <input type="checkbox" id="showSystemPermissions" className="mr-2" onChange={onSystemPermissionFilterChange} />
          Show system permissions
        </label>
        <Input placeholder="quicksearch" className="w-full sm:w-1/4" onKeyUp={handleSearch} />
      </div>
    </fieldset>
  );
};

export default PermissionListFilters;
