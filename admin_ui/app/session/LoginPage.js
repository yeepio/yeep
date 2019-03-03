import React from 'react';
import { Link } from '@reach/router';
import Head from '../../components/Head';

const LoginPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Login</title>
      </Head>
      <h1>Login Page (WIP)</h1>
      <Link to="/">Visit dashboard</Link>
    </React.Fragment>
  );
};

export default LoginPage;
