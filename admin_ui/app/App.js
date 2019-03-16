import React from 'react';
import { Router } from '@reach/router';
import './main.css';
import Store from './Store';

/*
  We want both the Login view and the Dashboard view to be part of the main bundle
  (and thus appear immediatelly to the user once the bundle is loaded)
  DashboardSection contains a nested <Router> which loads all
  other pages using react-loadable
 */
import LoginPage from './session/LoginPage';
import DashboardSection from './dashboard/DashboardSection';
import ForgotPasswordPage from './session/ForgotPasswordPage';



/**
 * The top level component / wrapper
 */
const App = () => {
  return (
    <Store.Provider>
      <Router>
        <DashboardSection path="/*" />
        <LoginPage path="/login" />
        <ForgotPasswordPage path="/forgot-password" />
      </Router>
    </Store.Provider>
  );
};

export default App;
