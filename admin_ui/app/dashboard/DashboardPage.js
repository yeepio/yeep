import React from 'react';
import useDocumentTitle from '@rehooks/document-title';
import IconOrganisation from '../../icons/IconOrganisation';
import IconUser from '../../icons/IconUser';
import ButtonLink from '../../components/ButtonLink';
import IconPermission from '../../icons/IconPermission';
import IconRole from '../../icons/IconRole';
import { useSelector, useDispatch } from 'react-redux';
import { listOrgs } from '../org/orgStore';
import { listPermissions } from '../permission/permissionStore';
import { listRoles } from '../role/roleStore';
import Spinner from '../../components/Spinner';

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  console.log('render!');

  const orgCountLoading = useSelector((state) => state.org.list.isLoading);
  const orgCount = useSelector((state) => state.org.list.totalCount);
  const roleCountLoading = useSelector((state) => state.role.list.isLoading);
  const roleCount = useSelector((state) => state.role.list.totalCount);
  const permissionCountLoading = useSelector((state) => state.permission.list.isLoading);
  const permissionCount = useSelector((state) => state.permission.list.totalCount);
  const dispatch = useDispatch();

  React.useEffect(() => {
    // On component mount, load counts for all orgs
    dispatch(listOrgs());
    dispatch(listRoles());
    dispatch(listPermissions());
  }, [dispatch]);

  const userFullName = useSelector((state) => state.session.user.fullName);
  return (
    <div className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <h1 className="mb-4 font-semibold text-3xl">Dashboard</h1>
      <p className="mb-4">
        Welcome <strong>{userFullName}</strong>. You Yeep installation is currently helping you
        manage the following:
      </p>
      <div className="sm:flex flex-wrap">
        <div className="border border-grey rounded p-4 sm:mr-4 flex-auto mb-4 text-center">
          <IconOrganisation className="inline-block mb-4" color="#8492A6" height={44} />
          <h2 className="mb-4 text-2xl">
            {orgCountLoading && <Spinner size="36" />}
            {!orgCountLoading && (
              <React.Fragment>
                <strong>{orgCount}</strong> organizations
              </React.Fragment>
            )}
          </h2>
          <ButtonLink to="organizations">View all organizations</ButtonLink>
        </div>
        <div className="border border-grey rounded p-4 sm:mr-4 flex-auto mb-4 text-center">
          <IconUser className="inline-block mb-4" color="#8492A6" height={44} />
          <h2 className="mb-4 text-2xl">
            <strong>???</strong> users
          </h2>
          <ButtonLink to="users">View all users</ButtonLink>
        </div>
        <div className="border border-grey rounded p-4 sm:mr-4 flex-auto mb-4 text-center">
          <IconPermission className="inline-block mb-4" color="#8492A6" height={44} />
          <h2 className="mb-4 text-2xl">
            {permissionCountLoading && <Spinner size="36" />}
            {!permissionCountLoading && (
              <React.Fragment>
                <strong>{permissionCount}</strong> permissions
              </React.Fragment>
            )}
          </h2>
          <ButtonLink to="permissions">View all permissions</ButtonLink>
        </div>
        <div className="border border-grey rounded p-4 sm:mr-4 flex-auto mb-4 text-center">
          <IconRole className="inline-block mb-4" color="#8492A6" height={44} />
          <h2 className="mb-4 text-2xl">
            {roleCountLoading && <Spinner size="36" />}
            {!roleCountLoading && (
              <React.Fragment>
                <strong>{roleCount}</strong> roles
              </React.Fragment>
            )}
          </h2>
          <ButtonLink to="roles">View all roles</ButtonLink>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
