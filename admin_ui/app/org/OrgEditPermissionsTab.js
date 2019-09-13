import React from 'react';
import { Link } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';
import Button from '../../components/Button';
import PermissionCreateModal from '../modals/PermissionCreateModal';
import PermissionEditModal from '../modals/PermissionEditModal';
import PermissionDeleteModal from '../modals/PermissionDeleteModal';
import {
  openPermissionCreateModal,
  openPermissionEditModal,
  openPermissionDeleteModal,
} from '../modals/permissionModalsStore';
import PermissionGrid from '../../components/PermissionGrid';
import {
  listOrgPermissions,
  setOrgPermissionListPage,
  setOrgPermissionListLimit,
} from './orgStore';
import yeepClient from '../yeepClient';

const OrgEditPermissionsTab = () => {
  const org = useSelector((state) => state.org.form.values);
  const isLoading = useSelector((state) => state.org.permission.list.isLoading);
  const records = useSelector((state) => state.org.permission.list.records);
  const totalCount = useSelector((state) => state.org.permission.list.totalCount);
  const limit = useSelector((state) => state.org.permission.list.limit);
  const page = useSelector((state) => state.org.permission.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listOrgPermissions());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listOrgPermissions);
    };
  }, [dispatch, limit, page, org]);

  const reload = React.useCallback(() => {
    dispatch(listOrgPermissions());
  }, [dispatch]);

  const onPermissionDelete = React.useCallback(
    (permission) => {
      // dispatch(openPermissionDeleteModal({ permission }));
    },
    [dispatch]
  );

  const onPermissionEdit = React.useCallback(
    (permission) => {
      // dispatch(openPermissionDeleteModal({ permission }));
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setOrgPermissionListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setOrgPermissionListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setOrgPermissionListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <PermissionCreateModal />
      <PermissionEditModal />
      <PermissionDeleteModal />
      <fieldset className="mb-6">
        <legend>New permissions</legend>
        <Button
          onClick={() => {
            dispatch(openPermissionCreateModal());
          }}
        >
          Create new permission
        </Button>
        <p className="mt-4">
          Tip: If you want to create a permission that is <em>not</em> scoped to the
          &quot;ORGNAME&quot; organization, please{' '}
          <Link to="/permissions">visit the permissions page</Link>.
        </p>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Existing permissions</legend>
        <PermissionGrid
          isLoading={isLoading}
          records={records}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageNext={onPageNext}
          onPagePrevious={onPagePrevious}
          onLimitChange={onLimitChange}
          onRecordEdit={onPermissionEdit}
          onRecordDelete={onPermissionDelete}
        />
      </fieldset>
      <p className="flex">
        <Link to={`/organizations/${org.id}/edit`}>&laquo; Organization details</Link>
        <Link to={`/organizations/${org.id}/edit/roles`} className="ml-auto">
          Roles &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

export default OrgEditPermissionsTab;
