import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  roles: [],
  totalRoles: 0,
  roleListLimit: 10,
  isRoleListLoading: false,
  cursors: [],
  nextCursor: undefined,
  filters: {
    isSystemRole: false,
    queryText: '',
  },
};

const initListRoles = createAction('ROLE_LIST_INIT');
const resolveListRoles = createAction('ROLE_LIST_RESOLVE');
const rejectListRoles = createAction('ROLE_LIST_REJECT');

export const setRoleListLimit = createAction('ROLE_LIST_LIMIT_SET');
export const setRoleListCursors = createAction('ROLE_LIST_CURSORS_SET');
export const setRoleListFilters = createAction('ROLE_LIST_FILTERS_SET');

export const listRoles = (props) => (dispatch) => {
  dispatch(initListRoles());
  return yeepClient
    .api()
    .then((api) =>
      api.role.list({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(api.role.list),
      })
    )
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
      totalCount: action.payload.totalCount,
      nextCursor: action.payload.nextCursor,
    }),
    [setRoleListLimit]: (state, action) => ({
      ...state,
      cursors: [],
      roleListLimit: action.payload.limit,
    }),
    [setRoleListCursors]: (state, action) => ({
      ...state,
      cursors: action.payload.cursors,
    }),
    [setRoleListFilters]: (state, action) => ({
      ...state,
      filters: {
        ...state.filters,
        ...action.payload,
      },
    }),
  },
  initialState
);
