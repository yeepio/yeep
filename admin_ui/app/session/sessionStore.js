import { createAction, handleActions } from 'redux-actions';

// initial state
export const initialState = {
  user: {},
  loginError: {},
  isLoginPending: false,
};

// actions
const initLogin = createAction('LOGIN_INIT');
const resolveLogin = createAction('LOGIN_RESOLVE', (user) => ({ user }));
const rejectLogin = createAction('LOGIN_REJECT', (err) => ({ err }));
const mockApiRequest = (user, password) =>
  new Promise((resolve) => {
    console.log(`Logging in with ${user} / ${password}`);
    setTimeout(() => {
      const user = {
        id: '507f191e810c19729de860ea',
        username: 'wile',
        fullName: 'Wile E. Coyote',
        picture: 'https://www.acme.com/pictures/coyote.png',
      };
      resolve(user);
    }, 2000);
  });
export const login = (user, password) => (dispatch) => {
  dispatch(initLogin());
  mockApiRequest(user, password)
    .then((user) => dispatch(resolveLogin(user)))
    .catch((err) => dispatch(rejectLogin(err)));
};

export const logout = createAction('LOGOUT');

// reducer
export const reducer = handleActions(
  {
    [initLogin]: () => ({ ...initialState, isLoginPending: true }),
    [rejectLogin]: (state, action) => ({
      ...state,
      isLoginPending: false,
      loginError: action.payload.err,
    }),
    [resolveLogin]: (state, action) => ({
      ...state,
      isLoginPending: false,
      user: action.payload.user,
    }),
    [logout]: () => initialState,
  },
  initialState
);
