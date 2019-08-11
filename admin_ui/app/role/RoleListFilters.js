import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncSelect from 'react-select/lib/Async';
import debounce from 'lodash/debounce';
import Input from '../../components/Input';
import { setRoleListFilters } from './roleStore';
import Checkbox from '../../components/Checkbox';
import yeepClient from '../yeepClient';
import OrgOption from '../../utilities/OrgOption';

function fetchScopeOptionsAsync(inputValue) {
  return yeepClient.api().then((api) => {
    return api.org
      .list({
        q: inputValue || undefined,
        limit: 10,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchScopeOptionsAsync),
      })
      .then((data) => {
        return data.orgs.map((e) => OrgOption.fromRecord(e).toOption());
      });
  });
}

const RoleListFilters = () => {
  const filters = useSelector((state) => state.role.filters);
  const [scope, setScope] = useState(
    filters.scope
      ? OrgOption.fromRecord({ id: filters.scope, name: filters.scope }).toOption()
      : null
  );

  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      // on unmount cancel in-flight request
      yeepClient.redeemCancelToken(fetchScopeOptionsAsync);
    };
  });

  const onSystemRoleChage = useCallback(
    (event) => {
      dispatch(setRoleListFilters({ isSystemRole: event.target.checked }));
    },
    [dispatch]
  );

  const applyQueryText = useMemo(() => {
    return debounce((queryText) => {
      dispatch(setRoleListFilters({ queryText }));
    }, 600);
  }, [dispatch]);

  const onQueryTextChange = useCallback(
    (event) => {
      applyQueryText(event.target.value);
    },
    [applyQueryText]
  );

  const onScopeChange = useCallback(
    (selectedOption) => {
      setScope(selectedOption);
      dispatch(setRoleListFilters({ scope: selectedOption ? selectedOption.value : '' }));
    },
    [setScope, dispatch]
  );

  return (
    <fieldset className="mb-6">
      <legend>Filters and quick search</legend>
      <div className="sm:flex items-center">
        {/* Async select is controlled by design
        We need to retrieve data from server on mount and update the component */}
        <AsyncSelect
          id="scope"
          className="flex-auto mb-3 sm:mb-0 sm:mr-3"
          placeholder="All organisations"
          loadOptions={fetchScopeOptionsAsync}
          isClearable={true}
          defaultOptions={true}
          value={scope}
          onChange={onScopeChange}
        />
        {/* Checkbox and Input need NOT be controlled */}
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
