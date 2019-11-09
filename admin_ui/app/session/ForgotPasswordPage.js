import React, { useCallback, useState } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import Input from '../../components/Input';
import Button from '../../components/Button';
import isEmpty from 'lodash/isEmpty';
import { forgotPassword, resetForgotPasswordErrors } from './sessionStore';

const ForgotPasswordPage = () => {
  const isForgotPasswordPending = useSelector((state) => state.session.isForgotPasswordPending);
  const isForgotPasswordComplete = useSelector((state) => state.session.isForgotPasswordComplete);
  const forgotPasswordErrors = useSelector((state) => state.session.forgotPasswordErrors);
  const dispatch = useDispatch();
  const [userKey, setUserKey] = useState('');

  const handleUserKeyChange = useCallback(
    (event) => {
      if (!isEmpty(forgotPasswordErrors)) {
        dispatch(resetForgotPasswordErrors());
      }
      setUserKey(event.target.value);
    },
    [dispatch, forgotPasswordErrors]
  );

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      // Ensure only a single forgotPass request is
      // running at any given time
      if (!isForgotPasswordPending) {
        dispatch(forgotPassword(userKey)).then(() => {
        });
      }
    },
    [dispatch, userKey, isForgotPasswordPending]
  );

  useDocumentTitle('Forgot password - Yeep admin UI');
  return (
    <div className="w-screen min-h-screen bg-grey-light flex items-center justify-center">
      <form className="block text-center w-full p-3 sm:w-auto" action="/" onSubmit={handleSubmit}>
        <img src="/yeep-logo-horizontal.svg" alt="Yeep logo" className="mb-6 w-48" />
        <h2 className="font-bold text-2xl mb-6">Yeep administration - Forgot password</h2>
        {isForgotPasswordComplete && (
          <div className="bg-green-lightest text-green-dark rounded border border-green p-3 mb-4">
            TODO: Instructions go here
          </div>
        )}
        <div className="text-left mb-6">
          <label htmlFor="email" className="block mb-2">
            Username / email:
          </label>
          <Input
            id="email"
            className="mb-4 w-full"
            placeholder="username or email"
            value={userKey}
            onChange={handleUserKeyChange}
          />
        </div>
        <Button type="submit" className="w-4/5 mb-4">
          <React.Fragment>
            {isForgotPasswordPending && (
              <img
                src="/spinner.svg"
                alt="*"
                width={20}
                height={20}
                className="inline-block mr-3 align-middle"
              />
            )}
          </React.Fragment>
          Submit form
        </Button>
        <Link to="/login" className="block">
          Return to the login page
        </Link>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
