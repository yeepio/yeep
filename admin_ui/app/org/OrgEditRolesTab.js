import React from 'react';
import { Link } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button';
import RoleCreateModal from '../role/RoleCreateModal';
import RoleDeleteModal from '../role/RoleDeleteModal';
import RoleEditModal from '../role/RoleEditModal';
import RoleGrid from '../role/RoleGrid';
import {
  listRoles,
  setRoleListPage,
  setRoleListLimit,
  setRoleUpdateRecord,
  showRoleDeleteForm,
  showRoleUpdateForm,
  showRoleCreateForm,
  setRoleDeleteRecord,
} from '../role/roleStore';
import yeepClient from '../yeepClient';
import PermissionCreateModal from '../permission/PermissionCreateModal';

const OrgEditRoleTab = () => {
  const org = useSelector((state) => state.org.update.record);
  const isLoading = useSelector((state) => state.role.list.isLoading);
  const records = useSelector((state) => state.role.list.records);
  const totalCount = useSelector((state) => state.role.list.totalCount);
  const limit = useSelector((state) => state.role.list.limit);
  const page = useSelector((state) => state.role.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listRoles({ scope: org.id }));
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listRoles);
    };
  }, [dispatch, limit, page, org]);

  const reload = React.useCallback(() => {
    dispatch(listRoles({ scope: org.id }));
  }, [dispatch, org]);

  const onRoleDelete = React.useCallback(
    (role) => {
      dispatch(setRoleDeleteRecord(role));
      dispatch(showRoleDeleteForm());
    },
    [dispatch]
  );

  const onRoleEdit = React.useCallback(
    (role) => {
      dispatch(setRoleUpdateRecord(role));
      dispatch(showRoleUpdateForm());
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setRoleListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setRoleListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setRoleListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <RoleCreateModal org={org} />
      <RoleEditModal onSuccess={reload} />
      <RoleDeleteModal onSuccess={reload} />
      <fieldset className="mb-6">
        <legend>New roles</legend>
        <Button onClick={() => dispatch(showRoleCreateForm())}>Create new role</Button>
        <p className="mt-4">
          Tip: If you want to create a role that is <em>not</em> scoped to the &quot;{org.name}
          &quot; organization, please visit the <Link to="/roles">roles</Link> page.
        </p>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Existing roles</legend>
        <RoleGrid
          isLoading={isLoading}
          records={records}
          totalCount={totalCount}
          page={page}
          pageSize={limit}
          onPageNext={onPageNext}
          onPagePrevious={onPagePrevious}
          onLimitChange={onLimitChange}
          onRecordEdit={onRoleEdit}
          onRecordDelete={onRoleDelete}
        />
      </fieldset>
      <p className="flex">
        <Link to={`/organizations/${org.id}/edit/permissions`}>&laquo; Permissions</Link>
        <Link to={`/organizations/${org.id}/edit/users`} className="ml-auto">
          Users &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

export default OrgEditRoleTab;
