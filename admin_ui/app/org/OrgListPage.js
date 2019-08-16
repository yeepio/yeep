import React, { useEffect, useCallback, useMemo } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import Input from '../../components/Input';
import Grid from '../../components/Grid';
import { listOrgs, setOrgListPage, setOrgListLimit } from './orgStore';
import yeepClient from '../yeepClient';

let headings = [
  { label: 'Name', sort: 'asc', className: 'text-left' },
  { label: 'Slug / URL key' },
  { label: 'User count' },
  { label: 'Role count' },
  { label: 'Permission count' },
  { label: 'Actions', isSortable: false },
];

const OrgListPage = () => {
  const isLoading = useSelector((state) => state.org.list.isLoading);
  const records = useSelector((state) => state.org.list.records);
  const totalCount = useSelector((state) => state.org.list.totalCount);
  const limit = useSelector((state) => state.org.list.limit);
  const filters = useSelector((state) => state.org.list.filters);
  const page = useSelector((state) => state.org.list.page);

  console.log(records);

  const dispatch = useDispatch();

  const entitiesStart = useMemo(() => page * limit + 1, [page, limit]);
  const entitiesEnd = useMemo(
    () => (records.length >= limit ? (page + 1) * limit : records.length),
    [records, page, limit]
  );

  useEffect(() => {
    dispatch(listOrgs());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listOrgs);
    };
  }, [dispatch, limit, page, filters]);

  const reload = useCallback(() => {
    dispatch(listOrgs());
  }, [dispatch]);

  const onPermissionDelete = useCallback(
    (org) => {
      // dispatch(openOrgDeleteModal({ org }));
    },
    [dispatch]
  );

  const onPageNext = useCallback(() => {
    dispatch(setOrgListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = useCallback(() => {
    dispatch(setOrgListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setOrgListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  useDocumentTitle('Organizations');

  return (
    <React.Fragment>
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="mb-6 font-semibold text-3xl">Organizations</h1>
      <fieldset className="mb-6">
        <legend>Quick search</legend>
        <Input id="quicksearch" placeholder="quicksearch" />
      </fieldset>
      <Grid
        className="mb-6"
        headings={headings}
        data={records}
        entitiesStart={entitiesStart}
        entitiesEnd={entitiesEnd}
        totalCount={totalCount}
        hasNext={records.length >= limit}
        hasPrevious={page > 0}
        onNextClick={onPageNext}
        onPreviousClick={onPagePrevious}
        onLimitChange={onLimitChange}
        isLoading={isLoading}
        renderer={(org, index) => {
          return (
            <tr key={`gridRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${org.id}/edit`}>{org.orgLabel}</Link>
              </td>
              <td className="p-2 text-center">{org.slug}</td>
              <td className="p-2 text-center">
                <a href="/">{org.users}</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">{org.roles}</a>
              </td>
              <td className="p-2 text-center">
                <a href="/">{org.permissions}</a>
              </td>
              <td className="p-2 text-center">
                <Link to={`${org.id}/edit`}>Edit</Link> <a href="/">Delete</a>
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

export default OrgListPage;
