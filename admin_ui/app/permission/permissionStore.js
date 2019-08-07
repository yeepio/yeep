import { createAction, handleActions } from 'redux-actions';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  permissions: [],
  permissionCount: 0,
  limit: 10,
  cursors: [],
  page: 0,
  filters: {
    isSystemPermission: false,
    queryText: '',
  },
  isPermissionListLoading: false,
  isPermissionCreationPending: false,
};

const initListPermissions = createAction('PERMISSION_LIST_INIT');
const resolveListPermissions = createAction('PERMISSION_LIST_RESOLVE');
const rejectListPermissions = createAction('PERMISSION_LIST_REJECT');

export const setPermissionListLimit = createAction('PERMISSION_LIST_LIMIT_SET');
export const setPermissionListPage = createAction('PERMISSION_LIST_PAGE_SET');
export const setPermissionListFilters = createAction('PERMISSION_LIST_FILTERS_SET');

export const listPermissions = (props = {}) => (dispatch, getState) => {
  const { permission: store } = getState();

  dispatch(initListPermissions());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.list({
        limit: store.limit,
        cursor: store.cursors[store.page - 1],
        isSystemPermission: store.filters.isSystemPermission,
        q: store.filters.queryText || undefined,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listPermissions),
        ...props,
      })
    )
    .then((data) => {
      dispatch(resolveListPermissions(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectListPermissions(err));
      return false;
    });
};

export const reducer = handleActions(
  {
    [initListPermissions]: (state) => ({
      ...state,
      isPermissionListLoading: true,
    }),
    [resolveListPermissions]: (state, action) => ({
      ...state,
      isPermissionListLoading: false,
      permissions: action.payload.permissions,
      cursors: [...state.cursors, action.payload.nextCursor],
      permissionCount: action.payload.permissionCount,
    }),
    [setPermissionListLimit]: (state, action) => ({
      ...state,
      cursors: [],
      page: 0,
      limit: action.payload.limit,
    }),
    [setPermissionListPage]: (state, action) => ({
      ...state,
      page: action.payload.page,
    }),
    [setPermissionListFilters]: (state, action) => ({
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
