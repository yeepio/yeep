import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncSelect from 'react-select/lib/Async';
import debounce from 'lodash/debounce';
import Input from '../../components/Input';
import { setPermissionListFilters } from './permissionStore';
import Checkbox from '../../components/Checkbox';
import yeepClient from '../yeepClient';
import OrgOption from '../../utilities/OrgOption';
import RoleOption from '../../utilities/RoleOption';

function fetchOrgOptionsAsync(inputValue) {
  return yeepClient.api().then((api) => {
    return api.org
      .list({
        q: inputValue || undefined,
        limit: 10,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchOrgOptionsAsync),
      })
      .then((data) => {
        return data.orgs.map((e) => OrgOption.fromRecord(e).toOption());
      });
  });
}

function fetchRoleOptionsAsync(inputValue) {
  return yeepClient.api().then((api) => {
    return api.role
      .list({
        q: inputValue || undefined,
        limit: 10,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchRoleOptionsAsync),
      })
      .then((data) => {
        return data.roles.map((e) => RoleOption.fromRecord(e).toOption());
      });
  });
}

const PermissionListFilters = () => {
  const filters = useSelector((state) => state.permission.list.filters);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      // on unmount cancel any in-flight requests
      yeepClient.redeemCancelToken(fetchOrgOptionsAsync);
    };
  });

  const onSystemPermissionChage = useCallback(
    (event) => {
      dispatch(setPermissionListFilters({ isSystemPermission: event.target.checked }));
    },
    [dispatch]
  );

  const setQueryText = useCallback(
    debounce((queryText) => {
      dispatch(setPermissionListFilters({ queryText }));
    }, 600),
    [dispatch]
  );

  const onQueryTextChange = useCallback(
    (event) => {
      setQueryText(event.target.value);
    },
    [setQueryText]
  );

  const onOrgChange = useCallback(
    (selectedOption) => {
      dispatch(
        setPermissionListFilters({
          org: selectedOption ? OrgOption.fromOption(selectedOption).toRecord() : {},
        })
      );
    },
    [dispatch]
  );

  const onRoleChange = useCallback(
    (selectedOption) => {
      dispatch(
        setPermissionListFilters({
          role: selectedOption ? RoleOption.fromOption(selectedOption).toRecord() : {},
        })
      );
    },
    [dispatch]
  );

  return (
    <fieldset className="mb-6">
      <legend>Filters and quick search</legend>
      <div className="sm:flex items-center">
        <AsyncSelect
          id="role"
          className="flex-auto mb-3 sm:mb-0 sm:mr-3"
          placeholder="All roles"
          loadOptions={fetchRoleOptionsAsync}
          isClearable={true}
          defaultOptions={true}
          onChange={onRoleChange}
          defaultValue={filters.role.id ? RoleOption.fromRecord(filters.role).toOption() : null}
        />
        <AsyncSelect
          id="org"
          className="flex-auto mb-3 sm:mb-0 sm:mr-3"
          placeholder="All organisations"
          loadOptions={fetchOrgOptionsAsync}
          isClearable={true}
          defaultOptions={true}
          onChange={onOrgChange}
          defaultValue={filters.org.id ? OrgOption.fromRecord(filters.org).toOption() : null}
        />
        <label htmlFor="isSystemPermission" className="block flex-initial mb-3 sm:mb-0 sm:mr-3">
          <Checkbox
            id="isSystemPermission"
            className="mr-2"
            defaultChecked={filters.isSystemPermission}
            onChange={onSystemPermissionChage}
          />
          Show only system permissions
        </label>
        <Input
          placeholder="quicksearch"
          defaultValue={filters.queryText}
          className="w-full sm:w-1/3"
          onChange={onQueryTextChange}
        />
      </div>
    </fieldset>
  );
};

export default PermissionListFilters;

{
  /* <fieldset className="mb-6">
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
            <input
              type="checkbox"
              id="showSystemPermissions"
              className="mr-2"
              onChange={handleSystemPermissionFilter}
            />
            Show system permissions
          </label>
          <Input placeholder="quicksearch" className="w-full sm:w-1/4" onKeyUp={handleSearch} />
        </div>
      </fieldset> */
}
