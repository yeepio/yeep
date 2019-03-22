import React from 'react';
import { Router } from '@reach/router';
import './main.css';
import Store from './Store';

import LoginPage from './session/LoginPage';
import ForgotPasswordPage from './session/ForgotPasswordPage';
import AppInnerModule from './AppInnerModule';

const App = () => {
  return (
    <Store.Provider>
      <Router>
        <AppInnerModule path="/*" />
        <LoginPage path="/login" />
        <ForgotPasswordPage path="/forgot-password" />
      </Router>
    </Store.Provider>
  );
};

export default App;
