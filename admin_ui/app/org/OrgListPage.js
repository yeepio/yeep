import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import {
  listOrgs,
  setOrgListPage,
  setOrgListLimit,
  showOrgDeleteForm,
  setOrgDeleteRecord,
} from './orgStore';
import yeepClient from '../yeepClient';
import OrgDeleteModal from './OrgDeleteModal';
import OrgListFilters from './OrgListFilters';
import OrgGrid from './OrgGrid';

const OrgListPage = () => {
  const isLoading = useSelector((state) => state.org.list.isLoading);
  const records = useSelector((state) => state.org.list.records);
  const totalCount = useSelector((state) => state.org.list.totalCount);
  const limit = useSelector((state) => state.org.list.limit);
  const filters = useSelector((state) => state.org.list.filters);
  const page = useSelector((state) => state.org.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listOrgs());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listOrgs);
    };
  }, [dispatch, limit, page, filters]);

  const reload = React.useCallback(() => {
    dispatch(listOrgs());
  }, [dispatch]);

  const onOrgDelete = React.useCallback(
    (org) => {
      dispatch(setOrgDeleteRecord(org));
      dispatch(showOrgDeleteForm());
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setOrgListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setOrgListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setOrgListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  useDocumentTitle('Organizations');

  return (
    <React.Fragment>
      <OrgDeleteModal onSuccess={reload} onError={(err) => console.error(err)} />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="mb-6 font-semibold text-3xl">Organizations</h1>
      <OrgListFilters />
      <OrgGrid
        className="mb-6"
        isLoading={isLoading}
        records={records}
        totalCount={totalCount}
        page={page}
        pageSize={limit}
        onPageNext={onPageNext}
        onPagePrevious={onPagePrevious}
        onLimitChange={onLimitChange}
        getRecordEditLink={(record) => `${record.id}/edit`}
        onRecordDelete={onOrgDelete}
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default OrgListPage;
