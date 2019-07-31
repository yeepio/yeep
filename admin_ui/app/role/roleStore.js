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

const changeRoleListLimit = createAction('ROLE_LIST_LIMIT_CHANGE');

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

export const updateRoleListLimit = (props) => (dispatch) => {
  dispatch(changeRoleListLimit(props))
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
}

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
    [changeRoleListLimit]: (state, action) => ({
      ...state,
      roleListLimit: action.payload.limit,
    })
  },
  initialState
);
