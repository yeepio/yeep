import React from 'react';
import { Router, Link } from '@reach/router';
import OrgListPage from './OrgListPage';
import OrgCreatePage from './OrgCreatePage';
import OrgEditPage from './OrgEditPage';

const OrgMaster = () => {
  return (
    <React.Fragment>
      <h1>Organization Master (WIP)</h1>
      <ul>
        <li>
          <Link to="/">Back to dashboard</Link>
        </li>
        <li>
          <Link to="">List orgs</Link>
        </li>
        <li>
          <Link to="create">Create org</Link>
        </li>
        <li>
          <Link to="123/edit">Edit org 123</Link>
        </li>
      </ul>

      <Router>
        <OrgListPage path="/" />
        <OrgCreatePage path="/create" />
        <OrgEditPage path="/:orgId/edit" />
      </Router>
    </React.Fragment>
  );
};

export default OrgMaster;
