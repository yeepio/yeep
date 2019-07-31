import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  roles: [],
  isRoleListLoading: false,
};

const initListRoles = createAction('ROLE_LIST_INIT');
const resolveListRoles = createAction('ROLE_LIST_RESOLVE');
const rejectListRoles = createAction('ROLE_LIST_REJECT');

export const listRoles = (props) => (dispatch) => {
  dispatch(initListRoles());
  return yeepClient
    .api()
    .then((api) => api.role.list(props))
    .then((data) => {
      dispatch(resolveListRoles(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectListRoles(err));
      return false;
    });
};

export const reducer = handleActions(
  {
    [initListRoles]: () => ({ ...initialState, isRoleListLoading: true }),
    [resolveListRoles]: (state, action) => ({
      ...state,
      isRoleListLoading: false,
      roles: action.payload.roles,
    }),
  },
  initialState
);
