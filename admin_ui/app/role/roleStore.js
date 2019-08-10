import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  roles: [],
  roleCount: 0,
  cursors: [],
  page: 0,
  limit: 10,
  filters: {
    scope: '',
    isSystemRole: false,
    queryText: '',
  },
  isRoleListLoading: false,
  isRoleCreationPending: false,
  isRoleUpdatePending: false,
};

const initListRoles = createAction('ROLE_LIST_INIT');
const resolveListRoles = createAction('ROLE_LIST_RESOLVE');
const rejectListRoles = createAction('ROLE_LIST_REJECT');

export const setRoleListLimit = createAction('ROLE_LIST_LIMIT_SET');
export const setRoleListPage = createAction('ROLE_LIST_PAGE_SET');
export const setRoleListFilters = createAction('ROLE_LIST_FILTERS_SET');

const initCreateRole = createAction('ROLE_CREATE_INIT');
const resolveCreateRole = createAction('ROLE_CREATE_RESOLVE');
const rejectCreateRole = createAction('ROLE_CREATE_REJECT');

const initUpdateRole = createAction('ROLE_UPDATE_INIT');
const resolveUpdateRole = createAction('ROLE_UPDATE_RESOLVE');
const rejectUpdateRole = createAction('ROLE_UPDATE_REJECT');

export const listRoles = (props = {}) => (dispatch, getState) => {
  const { role: store } = getState();

  dispatch(initListRoles());
  return yeepClient
    .api()
    .then((api) =>
      api.role.list({
        limit: store.limit,
        cursor: store.cursors[store.page - 1],
        isSystemRole: store.filters.isSystemRole,
        q: store.filters.queryText || undefined,
        scope: store.filters.scope || undefined,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listRoles),
        ...props,
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

export const updateRole = (props) => (dispatch) => {
  dispatch(initUpdateRole());
  return yeepClient
    .api()
    .then((api) =>
      api.role.update({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(updateRole),
      })
    )
    .then((data) => {
      dispatch(resolveUpdateRole(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectUpdateRole(err));
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
      roleCount: action.payload.roleCount,
    }),
    [setRoleListLimit]: (state, action) => ({
      ...state,
      cursors: [],
      page: 0,
      limit: action.payload.limit,
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
    [initCreateRole]: (state) => ({
      ...state,
      isRoleCreationPending: true,
    }),
    [resolveCreateRole]: (state) => ({
      ...state,
      isRoleCreationPending: false,
    }),
    [initUpdateRole]: (state) => ({
      ...state,
      isRoleUpdatePending: true,
    }),
    [resolveUpdateRole]: (state) => ({
      ...state,
      isRoleUpdatePending: false,
    }),
  },
  initialState
);
