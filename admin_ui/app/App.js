import React from 'react';
import { Router } from '@reach/router';
import './main.css';
import { Provider } from 'react-redux';
import { store } from './appStore';
import LoginPage from './session/LoginPage';
import ForgotPasswordPage from './session/ForgotPasswordPage';
import AppInnerModule from './AppInnerModule';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppInnerModule path="/*" />
        <LoginPage path="/login" />
        <ForgotPasswordPage path="/forgot-password" />
      </Router>
    </Provider>
  );
};

export default App;
