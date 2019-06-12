import React from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ForgotPasswordPage = () => {
  useDocumentTitle('Forgot password - Yeep admin UI');
  return (
    <div className="w-screen min-h-screen bg-grey-light flex items-center justify-center">
      <form className="block text-center w-full p-3 sm:w-auto" action="/">
        <img src="/yeep-logo-horizontal.svg" alt="Yeep logo" className="mb-6 w-48" />
        <h2 className="font-bold text-2xl mb-6">Yeep administration - Forgot password</h2>
        <div className="text-left mb-6">
          <label htmlFor="email" className="block mb-2">
            Username / email:
          </label>
          <Input id="email" className="mb-4 w-full" placeholder="username or email" />
        </div>
        <Button className="w-4/5 mb-4">Sign in</Button>
        <Link to="/login" className="block">Return to the login page</Link>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
