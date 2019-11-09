import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';
import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';

// initial state
export const initialState = {
  user: {},
  loginErrors: {},
  isLoginPending: false,
  forgotPasswordErrors: {},
  isForgotPasswordPending: false,
  isForgotPasswordComplete: false,
};

// actions
const initLogin = createAction('LOGIN_INIT');
const resolveLogin = createAction('LOGIN_RESOLVE', (user) => {
  return { user };
});
const rejectLogin = createAction('LOGIN_REJECT');
export const resetLoginErrors = createAction('LOGIN_RESET_ERRORS');
const initLogout = createAction('LOGOUT_INIT');
export const resolveLogout = createAction('LOGOUT_RESOLVE');
const initForgotPassword = createAction('FORGOT_PASSWORD_INIT');
const resolveForgotPassword = createAction('FORGOT_PASSWORD_RESOLVE');
const rejectForgotPassword = createAction('FORGOT_PASSWORD_REJECT');
export const resetForgotPasswordErrors = createAction('FORGOT_PASSWORD_RESET_ERRORS');

export const login = (user, password) => (dispatch) => {
  dispatch(initLogin());
  return yeepClient
    .createSession({
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
      dispatch(rejectLogin(err));
      return false;
    });
};

export const logout = () => (dispatch) => {
  dispatch(initLogout());
  return yeepClient
    .destroySession()
    .catch(() => {
      // do nothing
    })
    .then(() => {
      dispatch(resolveLogout());
    });
};

export const forgotPassword = () => (dispatch) => {
  dispatch(initForgotPassword());
  // TODO: Do we need to enhance YeepClient for this?
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  })
    .then(() => {
      dispatch(resolveForgotPassword());
      return true;
    })
    .catch((err) => {
      dispatch(rejectForgotPassword(err));
      return false;
    });
};

// reducer
export const reducer = handleActions(
  {
    // Login flow
    [initLogin]: () => ({ ...initialState, isLoginPending: true }),
    [rejectLogin]: (state, action) => {
      return {
        ...state,
        isLoginPending: false,
        loginErrors:
          action.payload.code !== 400
            ? {
                generic: action.payload.message,
              }
            : parseYeepValidationErrors(action.payload),
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
        loginErrors: initialState.loginErrors,
      };
    },
    // Forgot password flow
    [initForgotPassword]: () => ({
      ...initialState,
      isForgotPasswordPending: true,
    }),
    [rejectForgotPassword]: (state, action) => {
      return {
        ...state,
        isForgotPasswordPending: false,
        isForgotPasswordComplete: false,
        forgotPasswordErrors: action.payload,
      };
    },
    [resolveForgotPassword]: (state, action) => ({
      ...state,
      isForgotPasswordPending: false,
      isForgotPasswordComplete: true,
    }),
  },
  initialState
);
