import React, { useContext } from 'react';
import { Link } from '@reach/router';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import useDocumentTitle from '@rehooks/document-title';
import Store from '../Store';

const LoginPage = () => {
  const store = useContext(Store);
  const [user, isLoginPending] = useObservable(
    () =>
      combineLatest(store.session.user$, store.session.isLoginPending$).pipe(
        debounceTime(0) // use debounce to ensure all streams have changed before update
      ),
    [store.session.user$.getValue(), store.session.isLoginPending$.getValue()]
  );

  console.log('render', user, isLoginPending);
  useDocumentTitle('Login');
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
