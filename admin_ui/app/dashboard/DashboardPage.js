import React from 'react';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector } from 'react-redux';
import IconOrganisation from '../../icons/IconOrganisation';
import IconUser from '../../icons/IconUser';
import ButtonLink from '../../components/ButtonLink';
import IconPermission from '../../icons/IconPermission';
import IconRole from '../../icons/IconRole';

const DashboardPage = () => {
  useDocumentTitle('Dashboard');

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
            <strong>???</strong> organisations
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
            <strong>???</strong> permissions
          </h2>
          <ButtonLink to="permissions">View all permissions</ButtonLink>
        </div>
        <div className="border border-grey rounded p-4 sm:mr-4 flex-auto mb-4 text-center">
          <IconRole className="inline-block mb-4" color="#8492A6" height={44} />
          <h2 className="mb-4 text-2xl">
            <strong>???</strong> roles
          </h2>
          <ButtonLink to="roles">View all roles</ButtonLink>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
