import React, { useCallback, useState } from 'react';
import { Link, navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import qs from 'query-string';
import isEmpty from 'lodash/isEmpty';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { login, resetLoginErrors } from './sessionStore';
import classnames from 'classnames';

function isUserKeyValid(userKey) {
  return userKey.length >= 2;
}

function isPasswordValid(password) {
  return password.length >= 8;
}

const LoginPage = () => {
  const isLoginPending = useSelector((state) => state.session.isLoginPending);
  const loginErrors = useSelector((state) => state.session.loginErrors);
  const dispatch = useDispatch();

  const [userKey, setUserKey] = useState('');
  const [password, setPassword] = useState('');

  const handleUserKeyChange = useCallback(
    (event) => {
      if (!isEmpty(loginErrors)) {
        dispatch(resetLoginErrors());
      }
      setUserKey(event.target.value);
    },
    [dispatch, loginErrors]
  );

  const handlePasswordChange = useCallback(
    (event) => {
      if (!isEmpty(loginErrors)) {
        dispatch(resetLoginErrors());
      }
      setPassword(event.target.value);
    },
    [dispatch, loginErrors]
  );

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
      <form className="block text-center w-full p-3 sm:w-auto login-form" onSubmit={handleSubmit}>
        <style jsx>{`
          .login-form {
            width:400px;
          }
        `}</style>
        <img src="/yeep-logo-horizontal.svg" alt="Yeep logo" className="mb-6 mx-auto w-48" />
        <h2 className="font-bold text-2xl mb-6">Yeep administration - Sign in</h2>
        {loginErrors.generic && (
          <div className="bg-red-lightest text-red rounded border border-red-lighter p-3 mb-4">
            {loginErrors.generic}
          </div>
        )}
        <div className="text-left mb-6">
          <label
            htmlFor="userKey"
            className={classnames('block', 'mb-2', { 'text-red': loginErrors.user })}
          >
            {loginErrors.user || 'Username / email:'}
          </label>
          <Input
            id="userKey"
            className="mb-4 w-full"
            placeholder="username or email"
            value={userKey}
            onChange={handleUserKeyChange}
          />
          <label
            htmlFor="password"
            className={classnames('block', 'mb-2', { 'text-red': loginErrors.password })}
          >
            {loginErrors.password || 'Password:'}
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
          // disabled={isLoginPending || !isUserKeyValid(userKey) || !isPasswordValid(password)}
        >
          <React.Fragment>
            {isLoginPending && (
              <img
                src="/spinner.svg"
                alt="*"
                width={20}
                height={20}
                className="inline-block mr-3 align-middle"
              />
            )}
          </React.Fragment>
          Sign in
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
