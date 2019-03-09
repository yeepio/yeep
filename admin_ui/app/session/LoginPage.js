import React, { useContext } from 'react';
import { Link } from '@reach/router';
import { useObservable } from 'rxjs-hooks';
import Head from '../../components/Head';
import Store from '../Store';

const LoginPage = () => {
  const store = useContext(Store);
  const user = useObservable(() => store.session.user$, store.session.user$.getValue());
  console.log(user);
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
