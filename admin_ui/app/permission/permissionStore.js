import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
import yeepClient from '../yeepClient';

// initial state
export const initialState = {
  list: {
    records: [],
    totalCount: 0,
    limit: 10,
    isLoading: false,
    cursors: [],
    page: 0,
    filters: {
      isSystemPermission: false,
      queryText: '',
      org: {},
      role: {},
    },
  },
  form: {
    values: {},
    isWritePending: false,
  },
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
        limit: store.list.limit,
        cursor: store.list.cursors[store.list.page - 1],
        isSystemPermission: store.list.filters.isSystemPermission,
        q: store.list.filters.queryText || undefined,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listPermissions),
        ...props,
      })
    )
    .then((data) => {
      dispatch(resolveListPermissions(data));
      return data.permissions;
    })
    .catch((err) => {
      dispatch(rejectListPermissions(err));
      return null;
    });
};

export const reducer = handleActions(
  {
    [initListPermissions]: produce((draft) => {
      draft.list.isLoading = true;
    }),
    [resolveListPermissions]: produce((draft, action) => {
      draft.list.isLoading = false;
      draft.list.records = action.payload.permissions;
      draft.list.cursors.push(action.payload.nextCursor);
      draft.list.totalCount = action.payload.permissionCount;
    }),
    [setPermissionListLimit]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.limit = action.payload.limit;
    }),
    [setPermissionListPage]: produce((draft, action) => {
      draft.list.page = action.payload.page;
    }),
    [setPermissionListFilters]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.filters = {
        ...draft.list.filters,
        ...action.payload,
      };
    }),
  },
  initialState
);
