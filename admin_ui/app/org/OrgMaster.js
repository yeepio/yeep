import React from 'react';
import { Router } from '@reach/router';
import OrgListPage from './OrgListPage';
import OrgCreatePage from './OrgCreatePage';
import OrgEditPage from './OrgEditPage';

const OrgMaster = () => {
  return (
    <Router className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <OrgListPage path="/" />
      <OrgCreatePage path="/create" />
      <OrgEditPage path="/:orgId/edit" />
    </Router>
  );
};

export default OrgMaster;
