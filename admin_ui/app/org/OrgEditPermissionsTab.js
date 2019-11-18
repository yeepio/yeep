import React from 'react';
import { Link } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import PermissionCreateModal from '../permission/PermissionCreateModal';
import PermissionDeleteModal from '../permission/PermissionDeleteModal';
import PermissionEditModal from '../permission/PermissionEditModal';
import PermissionGrid from '../permission/PermissionGrid';
import {
  listPermissions,
  setPermissionListPage,
  setPermissionListLimit,
  setPermissionUpdateRecord,
  showPermissionDeleteForm,
  showPermissionUpdateForm,
  showPermissionCreateForm,
  setPermissionDeleteRecord,
} from '../permission/permissionStore';
import yeepClient from '../yeepClient';

const OrgEditPermissionsTab = () => {
  const org = useSelector((state) => state.org.update.record);
  const isLoading = useSelector((state) => state.permission.list.isLoading);
  const records = useSelector((state) => state.permission.list.records);
  const totalCount = useSelector((state) => state.permission.list.totalCount);
  const limit = useSelector((state) => state.permission.list.limit);
  const page = useSelector((state) => state.permission.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listPermissions({ scope: org.id }));
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listPermissions);
    };
  }, [dispatch, limit, page, org]);

  const reload = React.useCallback(() => {
    dispatch(listPermissions({ scope: org.id }));
  }, [dispatch, org]);

  const onPermissionDelete = React.useCallback(
    (permission) => {
      dispatch(setPermissionDeleteRecord(permission));
      dispatch(showPermissionDeleteForm());
    },
    [dispatch]
  );

  const onPermissionEdit = React.useCallback(
    (permission) => {
      dispatch(setPermissionUpdateRecord(permission));
      dispatch(showPermissionUpdateForm());
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setPermissionListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setPermissionListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setPermissionListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <PermissionCreateModal org={org} />
      <PermissionEditModal onSuccess={reload} />
      <PermissionDeleteModal onSuccess={reload} />
      <fieldset className="mb-6">
        <legend>New permissions</legend>
        <Button onClick={() => dispatch(showPermissionCreateForm())}>Create new permission</Button>
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
          pageSize={limit}
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
