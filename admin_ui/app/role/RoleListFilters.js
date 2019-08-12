import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncSelect from 'react-select/lib/Async';
import debounce from 'lodash/debounce';
import Input from '../../components/Input';
import { setRoleListFilters } from './roleStore';
import Checkbox from '../../components/Checkbox';
import yeepClient from '../yeepClient';
import OrgOption from '../../utilities/OrgOption';

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

const RoleListFilters = () => {
  const filters = useSelector((state) => state.role.filters);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      // on unmount cancel in-flight request
      yeepClient.redeemCancelToken(fetchOrgOptionsAsync);
    };
  });

  const onSystemRoleChage = useCallback(
    (event) => {
      dispatch(setRoleListFilters({ isSystemRole: event.target.checked }));
    },
    [dispatch]
  );

  const setQueryText = useCallback(() => {
    return debounce((queryText) => {
      dispatch(setRoleListFilters({ queryText }));
    }, 600);
  }, [dispatch]);

  const onQueryTextChange = useCallback(
    (event) => {
      setQueryText(event.target.value);
    },
    [setQueryText]
  );

  const onOrgChange = useCallback(
    (selectedOption) => {
      dispatch(
        setRoleListFilters({
          org: selectedOption ? OrgOption.fromOption(selectedOption).toRecord() : {},
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
          id="org"
          className="flex-auto mb-3 sm:mb-0 sm:mr-3"
          placeholder="All organisations"
          loadOptions={fetchOrgOptionsAsync}
          isClearable={true}
          defaultOptions={true}
          onChange={onOrgChange}
          defaultValue={filters.org.id ? OrgOption.fromRecord(filters.org).toOption() : null}
        />
        <label htmlFor="isSystemRole" className="block flex-initial mb-3 sm:mb-0 sm:mr-3">
          <Checkbox
            id="isSystemRole"
            className="mr-2"
            defaultChecked={filters.isSystemRole}
            onChange={onSystemRoleChage}
          />
          Show system roles
        </label>
        <Input
          placeholder="quicksearch"
          defaultValue={filters.queryText}
          className="w-full sm:w-1/3"
          onKeyUp={onQueryTextChange}
        />
      </div>
    </fieldset>
  );
};

export default RoleListFilters;
