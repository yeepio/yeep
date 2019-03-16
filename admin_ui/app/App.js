import React from 'react';
import { Router } from '@reach/router';
import './main.css';
import Store from './Store';

/*
  We want both the Login view and the Dashboard view to be part of the main bundle
  (and thus appear immediatelly to the user once the bundle is loaded)
  DashboardPage contains a nested <Router> which loads all other pages using
  react-loadable.
 */
import LoginPage from './session/LoginPage';
import DashboardPage from './dashboard/DashboardPage';

/**
 * The top level component / wrapper
 */
const App = () => {
  return (
    <Store.Provider>
      <Router>
        <LoginPage path="/login" />
        <DashboardPage path="/" />
      </Router>
    </Store.Provider>
  );
};

export default App;
