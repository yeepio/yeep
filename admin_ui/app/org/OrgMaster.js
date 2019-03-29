import React from 'react';
import { Router } from '@reach/router';
import OrgListPage from './OrgListPage';
import OrgCreatePage from './OrgCreatePage';
import OrgEditPage from './OrgEditPage';
import OrgEditPermissions from './OrgEditPermissions';
import OrgEditRoles from './OrgEditRoles';
import OrgEditUserMemberships from './OrgEditUserMemberships';

const OrgMaster = () => {
  return (
    <Router className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <OrgListPage path="/" />
      <OrgCreatePage path="/create" />
      <OrgEditPage path="/:orgId/edit" />
      <OrgEditPermissions path="/:orgId/edit/permissions" />
      <OrgEditRoles path="/:orgId/edit/roles" />
      <OrgEditUserMemberships path="/:orgId/edit/users" />
    </Router>
  );
};

export default OrgMaster;
