import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  roles: [],
  totalRoles: 0,
  roleListLimit: 10,
  isRoleListLoading: false,
  isRoleCreationPending: false,
  cursors: [],
  page: 0,
  filters: {
    isSystemRole: false,
    queryText: '',
  },
};

const initListRoles = createAction('ROLE_LIST_INIT');
const resolveListRoles = createAction('ROLE_LIST_RESOLVE');
const rejectListRoles = createAction('ROLE_LIST_REJECT');

const initCreateRole = createAction('ROLE_CREATE_INIT');
const resolveCreateRole = createAction('ROLE_CREATE_RESOLVE');
const rejectCreateRole = createAction('ROLE_CREATE_REJECT');

export const setRoleListLimit = createAction('ROLE_LIST_LIMIT_SET');
export const setRoleListPage = createAction('ROLE_LIST_PAGE_SET');
export const setRoleListFilters = createAction('ROLE_LIST_FILTERS_SET');

export const listRoles = (props) => (dispatch) => {
  dispatch(initListRoles());
  return yeepClient
    .api()
    .then((api) =>
      api.role.list({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listRoles),
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

export const createRole = (props) => (dispatch) => {
  dispatch(initCreateRole());
  return yeepClient
    .api()
    .then((api) =>
      api.role.create({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(createRole),
      })
    )
    .then((data) => {
      dispatch(resolveCreateRole(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectCreateRole(err));
      return false;
    });
};

export const reducer = handleActions(
  {
    [initListRoles]: (state) => ({
      ...state,
      isRoleListLoading: true,
    }),
    [resolveListRoles]: (state, action) => ({
      ...state,
      isRoleListLoading: false,
      roles: action.payload.roles,
      cursors: [...state.cursors, action.payload.nextCursor],
      rolesCount: action.payload.rolesCount,
    }),
    [initCreateRole]: (state) => ({
      ...state,
      isRoleCreationPending: true,
    }),
    [resolveCreateRole]: (state) => ({
      ...state,
      isRoleCreationPending: false,
    }),
    [setRoleListLimit]: (state, action) => ({
      ...state,
      cursors: [],
      page: 0,
      roleListLimit: action.payload.limit,
    }),
    [setRoleListPage]: (state, action) => ({
      ...state,
      page: action.payload.page,
    }),
    [setRoleListFilters]: (state, action) => ({
      ...state,
      page: 0,
      filters: {
        ...state.filters,
        ...action.payload,
      },
    }),
  },
  initialState
);
