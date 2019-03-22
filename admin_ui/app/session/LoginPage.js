import React, { useContext } from 'react';
import { Link } from '@reach/router';
import { combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import useDocumentTitle from '@rehooks/document-title';
import Store from '../Store';
import Input from '../../components/Input';
import Button from '../../components/Button';

const LoginPage = () => {
  useDocumentTitle('Sign in - Yeep admin UI');

  // Establish the session state
  const store = useContext(Store);
  const [user, isLoginPending] = useObservable(
    () =>
      combineLatest(store.session.user$, store.session.isLoginPending$).pipe(
        debounceTime(0) // use debounce to ensure all streams have changed before update
      ),
    [store.session.user$.getValue(), store.session.isLoginPending$.getValue()]
  );
  console.log('render', user, isLoginPending);

  return (
    <div className="w-screen min-h-screen bg-grey-light flex items-center justify-center">
      <form className="block text-center w-full p-3 sm:w-auto" action="/">
        <img src="/yeep-logo-horizontal.svg" alt="Yeep logo" className="mb-6 w-48" />
        <h2 className="mb-6">Yeep administration - Sign in</h2>
        <div className="text-left mb-6">
          <label htmlFor="email" className="block mb-2">Username / email:</label>
          <Input id="email" className="mb-4 w-full" placeholder="username or email"/>
          <label htmlFor="password" className="block mb-2">Password:</label>
          <Input id="password" type="password" className="mb-4 w-full"/>
          <Link to="/forgot-password" >Forgot your password?</Link>
        </div>
        <Button className="w-4/5">Sign in</Button>
        {isLoginPending && <span>User logging in...</span>}
        {/*<button
          onClick={() => {
            store.session.login({
              username: 'Bob',
              password: 'I-shot-the-$erif',
            });
          }}
        >
          Login in user
        </button>*/}
      </form>
    </div>
  );
};

export default LoginPage;
