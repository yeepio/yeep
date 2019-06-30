import React, { useCallback, useState } from 'react';
import { Link, navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import qs from 'query-string';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { login } from './sessionStore';

function isUserKeyValid(userKey) {
  return userKey.length >= 2;
}

function isPasswordValid(password) {
  return password.length >= 8;
}

const LoginPage = () => {
  const isLoginPending = useSelector((state) => state.session.isLoginPending);
  const loginError = useSelector((state) => state.session.loginError);
  const dispatch = useDispatch();

  const [userKey, setUserKey] = useState('');
  const [password, setPassword] = useState('');

  const handleUserKeyChange = useCallback((event) => {
    setUserKey(event.target.value);
  }, []);

  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      dispatch(login(userKey, password)).then((isLoggedIn) => {
        if (isLoggedIn) {
          const queryProps = qs.parse(location.search, { decode: true });
          navigate(queryProps.r || '/');
        }
      });
    },
    [dispatch, userKey, password]
  );

  useDocumentTitle('Sign in - Yeep admin UI');

  return (
    <div className="w-screen min-h-screen bg-grey-light flex items-center justify-center">
      <form className="block text-center w-full p-3 sm:w-auto" onSubmit={handleSubmit}>
        <img src="/yeep-logo-horizontal.svg" alt="Yeep logo" className="mb-6 w-48" />
        <h2 className="font-bold text-2xl mb-6">Yeep administration - Sign in</h2>
        {loginError && <p className="text-red">{loginError}</p>}
        <div className="text-left mb-6">
          <label htmlFor="userKey" className="block mb-2">
            Username / email:
          </label>
          <Input
            id="userKey"
            className="mb-4 w-full"
            placeholder="username or email"
            value={userKey}
            onChange={handleUserKeyChange}
          />
          <label htmlFor="password" className="block mb-2">
            Password:
          </label>
          <Input
            id="password"
            type="password"
            className="mb-4 w-full"
            value={password}
            onChange={handlePasswordChange}
          />
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
        <Button
          type="submit"
          className="w-4/5"
          disabled={!isUserKeyValid(userKey) || !isPasswordValid(password)}
        >
          Sign in
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
