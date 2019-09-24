import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import debounce from 'lodash/debounce';
import Input from '../../components/Input';
import { setOrgListFilters } from './orgStore';

const OrgListFilters = () => {
  const filters = useSelector((state) => state.role.list.filters);
  const dispatch = useDispatch();

  const setQueryText = React.useCallback(
    debounce((queryText) => {
      dispatch(setOrgListFilters({ queryText }));
    }, 600),
    [dispatch]
  );

  const onQueryTextChange = React.useCallback(
    (event) => {
      setQueryText(event.target.value);
    },
    [setQueryText]
  );

  return (
    <fieldset className="mb-6">
      <legend>Quick search</legend>
      <div className="sm:flex items-center">
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

export default OrgListFilters;
