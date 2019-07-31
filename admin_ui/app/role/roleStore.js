import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  roles: [],
  roleListLimit: 10,
  isRoleListLoading: false,
  nextRoleListCursor: '',
  previousRoleListCursor: '',
};

const initListRoles = createAction('ROLE_LIST_INIT');
const resolveListRoles = createAction('ROLE_LIST_RESOLVE');
const rejectListRoles = createAction('ROLE_LIST_REJECT');

export const setRoleListLimit = createAction('ROLE_LIST_LIMIT_SET');

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
    [initListRoles]: (state) => ({ ...state, isRoleListLoading: true }),
    [resolveListRoles]: (state, action) => ({
      ...state,
      isRoleListLoading: false,
      roles: action.payload.roles,
      previousRoleListCursor: '', // TODO: missing currentCursor / previousCursor logic
      nextRoleListCursor: action.payload.nextCursor,
    }),
    [setRoleListLimit]: (state, action) => ({
      ...state,
      roleListLimit: action.payload.limit,
    })
  },
  initialState
);
