import React, { useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncSelect from 'react-select/lib/Async';
import debounce from 'lodash/debounce';
import Input from '../../components/Input';
import { setRoleListFilters } from './roleStore';
import Checkbox from '../../components/Checkbox';
import yeepClient from '../yeepClient';
import formatOptionFromString from '../../utilities/formatOptionFromString';

const RoleListFilters = () => {
  const filters = useSelector((state) => state.role.filters);
  const [scope, setScope] = useState(filters.scope ? formatOptionFromString(filters.scope) : null);

  const dispatch = useDispatch();

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

  const fetchScopeOptionsAsync = useMemo(() => {
    let isInitialCall = true;
    return (inputValue) => {
      return yeepClient.api().then((api) => {
        return api.org
          .list({
            q: inputValue || undefined,
            limit: 10,
            cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(fetchScopeOptionsAsync),
          })
          .then((data) => {
            const options = data.orgs.map((org) => {
              return {
                label: org.name,
                value: org.id,
              };
            });

            // check if initial call
            if (isInitialCall) {
              isInitialCall = false;

              // Populate default value with data from server
              // i.e. including labels, not just values
              if (filters.scope) {
                const selectedOptions = options.filter((option) => option.value === filters.scope);

                if (selectedOptions.length) {
                  setScope(selectedOptions[0]);
                }
              }
            }

            return options;
          });
      });
    };
  }, [setScope]); // eslint-disable-line

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
