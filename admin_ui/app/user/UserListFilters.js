import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AsyncSelect from 'react-select/lib/Async';
import debounce from 'lodash/debounce';
import Input from '../../components/Input';
import { setUserListFilters } from './userStore';
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

const UserListFilters = () => {
  const filters = useSelector((state) => state.user.list.filters);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      // on unmount cancel any in-flight requests
      yeepClient.redeemCancelToken(fetchOrgOptionsAsync);
    };
  });

  const setQueryText = useCallback(
    debounce((queryText) => {
      dispatch(setUserListFilters({ queryText }));
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
        setUserListFilters({
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

export default UserListFilters;
