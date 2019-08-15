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
    org: {},
    isSystemRole: false,
    queryText: '',
  },
  isRoleListLoading: false,
  isRoleCreationPending: false,
  isRoleUpdatePending: false,
  isRoleInfoLoading: false,
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

const initGetRoleInfo = createAction('ROLE_INFO_INIT');
const resolveGetRoleInfo = createAction('ROLE_INFO_RESOLVE');
const rejectGetRoleInfo = createAction('ROLE_INFO_REJECT');

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
        scope: store.filters.org.id || undefined,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listRoles),
        ...props,
      })
    )
    .then((data) => {
      dispatch(resolveListRoles(data));
      return data.roles;
    })
    .catch((err) => {
      dispatch(rejectListRoles(err));
      return null;
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

export const getRoleInfo = (props) => (dispatch) => {
  dispatch(initGetRoleInfo());
  return yeepClient
    .api()
    .then((api) =>
      api.role.info({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getRoleInfo),
      })
    )
    .then((data) => {
      dispatch(resolveGetRoleInfo(data));
      return data.role;
    })
    .catch((err) => {
      dispatch(rejectGetRoleInfo(err));
      return null;
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
    [initGetRoleInfo]: (state) => ({
      ...state,
      isRoleInfoLoading: true,
    }),
    [resolveGetRoleInfo]: (state) => ({
      ...state,
      isRoleInfoLoading: false,
    }),
  },
  initialState
);
