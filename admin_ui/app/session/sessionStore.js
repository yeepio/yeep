import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  user: {},
  loginError: {
    generic: '',
    user: '',
    password: '',
  },
  isLoginPending: false,
};

// actions
const initLogin = createAction('LOGIN_INIT');
const resolveLogin = createAction('LOGIN_RESOLVE', (user) => ({ user }));
const rejectLogin = createAction('LOGIN_REJECT', (err) => {
  return { err };
});
export const resetLoginErrors = createAction('LOGIN_RESET_ERRORS');
const initLogout = createAction('LOGOUT_INIT');
const resolveLogout = createAction('LOGOUT_RESOLVE');

export const login = (user, password) => (dispatch) => {
  dispatch(initLogin());
  return yeepClient
    .login({
      user,
      password,
      projection: {
        profile: true,
      },
    })
    .then(({ user }) => {
      dispatch(resolveLogin(user));
      return true;
    })
    .catch((err) => {
      /*
        Let's return an error object with three keys:
          "user": Errors specific to the username / email field
          "password": Errors specific to the password field
          "generic": All other types of errors (user not found, server error, whatever)
        This object can be used by LoginPage.js to show errors in the appropriate positions
       */
      let formattedError = {
        generic: '',
        user: '',
        password: '',
      };
      if (err.code === 10001) {
        // User not found
        formattedError.generic = err.message;
      } else if (err.code === 400) {
        // We have an "Invalid request body". Let's go through err.details and see if we
        // can provide some meaningful errors for the "user" and / or "password" fields
        // Since it's possible that we have _multiple_ errors per field (i.e. "user" field
        // can both be empty and not have a length of 2 characters) we'll only show the first one.
        err.details.map((fieldError) => {
          if (fieldError.context.key === 'user' && formattedError.user === '') {
            // We have our first username / email error. we'll use it.
            formattedError.user = fieldError.message;
          } else if (fieldError.context.key === 'password' && formattedError.password === '') {
            // We have our first password error. We'll use it.
            formattedError.password = fieldError.message;
          }
        });
      } else {
        formattedError.generic = err.message;
      }
      dispatch(rejectLogin(formattedError));
      return false;
    });
};

export const logout = () => (dispatch) => {
  dispatch(initLogout());
  return yeepClient
    .logout()
    .catch(() => {
      // do nothing
    })
    .then(() => {
      dispatch(resolveLogout());
    });
};

// reducer
export const reducer = handleActions(
  {
    [initLogin]: () => ({ ...initialState, isLoginPending: true }),
    [rejectLogin]: (state, action) => {
      return {
        ...state,
        isLoginPending: false,
        loginError: action.payload.err,
      };
    },
    [resolveLogin]: (state, action) => ({
      ...state,
      isLoginPending: false,
      user: action.payload.user,
    }),
    [resolveLogout]: () => ({ ...initialState }),
    [resetLoginErrors]: (state) => {
      return {
        ...state,
        loginError: initialState.loginError,
      };
    },
  },
  initialState
);
