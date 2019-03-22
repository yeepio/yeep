import React from 'react';
import { Router } from '@reach/router';
import OrgListPage from './OrgListPage';
import OrgCreatePage from './OrgCreatePage';
import OrgEditPage from './OrgEditPage';

const OrgSection = () => {
  return (
    <Router>
      <OrgListPage path="/" />
      <OrgCreatePage path="/create" />
      <OrgEditPage path="/:orgId/edit" />
    </Router>
  );
};

export default OrgSection;
