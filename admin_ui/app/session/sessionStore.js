import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../../utilities/yeepClient';

// initial state
export const initialState = {
  user: {},
  loginError: '',
  isLoginPending: false,
};

// actions
const initLogin = createAction('LOGIN_INIT');
const resolveLogin = createAction('LOGIN_RESOLVE', (user) => ({ user }));
const rejectLogin = createAction('LOGIN_REJECT', (err) => {
  return { err };
});

export const login = (user, password) => (dispatch) => {
  dispatch(initLogin());
  return yeepClient
    .login({ user, password })
    .then(({ user }) => {
      dispatch(resolveLogin(user));
      return true;
    })
    .catch((err) => {
      dispatch(rejectLogin(err.message));
      return false;
    });
};

export const logout = createAction('LOGOUT');

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
    [logout]: () => initialState,
  },
  initialState
);
