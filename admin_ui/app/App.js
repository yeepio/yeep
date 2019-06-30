import React from 'react';
import { Router } from '@reach/router';
import './main.css';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { store } from './appStore';
import LoginPage from './session/LoginPage';
import ForgotPasswordPage from './session/ForgotPasswordPage';
import AppInnerModule from './AppInnerModule';

const persistor = persistStore(store, {
  debounce: 200,
});

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AppInnerModule path="/*" />
          <LoginPage path="/login" />
          <ForgotPasswordPage path="/forgot-password" />
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;
