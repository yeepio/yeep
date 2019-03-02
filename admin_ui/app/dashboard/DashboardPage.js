import React from 'react';
import { Link } from '@reach/router';
import TopNav from '../../components/TopNav';
// import AsideNav from '../../components/AsideNav';
// import PageWrapper from '../../components/PageWrapper';
import Head from '../../components/Head';

const DashboardPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Dashboard</title>
      </Head>
      <TopNav />
      <ul>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/organizations">Organizations</Link>
        </li>
        <li>
          <Link to="/permissions">Permissions</Link>
        </li>
        <li>
          <Link to="/roles">Roles</Link>
        </li>
        <li>
          <Link to="/users">Users</Link>
        </li>
      </ul>
      {/* <div className="mx-auto flex">
        <AsideNav />
        <PageWrapper />
      </div> */}
    </React.Fragment>
  );
};

export default DashboardPage;
