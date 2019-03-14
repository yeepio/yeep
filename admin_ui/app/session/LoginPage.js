import React, { useContext } from 'react';
import { Link } from '@reach/router';
import { useObservable } from 'rxjs-hooks';
import useDocumentTitle from '@rehooks/document-title';
import Store from '../Store';

const LoginPage = () => {
  const store = useContext(Store);
  const user = useObservable(() => store.session.user$, store.session.user$.getValue());
  const isLoginPending = useObservable(
    () => store.session.isLoginPending$,
    store.session.isLoginPending$.getValue()
  );
  useDocumentTitle('Login');

  console.log('render', user, isLoginPending);
  return (
    <React.Fragment>
      <h1>Login Page (WIP)</h1>
      {isLoginPending && <span>User logging in...</span>}
      <button
        onClick={() => {
          store.session.login({
            username: 'Bob',
            password: 'I-shot-the-$erif',
          });
        }}
      >
        Login in user
      </button>
      <br />
      <br />
      <Link to="/">Visit dashboard</Link>
    </React.Fragment>
  );
};

export default LoginPage;
