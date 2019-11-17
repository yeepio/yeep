import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
import yeepClient from '../yeepClient';
import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';

// initial state
export const initialState = {
  list: {
    records: [],
    totalCount: null,
    limit: 10,
    isLoading: false,
    cursors: [],
    page: 0,
    filters: {
      isSystemPermission: true,
      queryText: '',
      org: {},
      role: {},
    },
  },
  create: {
    isDisplayed: false,
    isSavePending: false,
    errors: {},
  },
  update: {
    record: {
      name: '',
      description: '',
      org: null,
    },
    isDisplayed: false,
    isSavePending: false,
    errors: {},
  },
  delete: {
    record: {},
    isDisplayed: false,
    isDeletePending: false,
    errors: {},
  },
};

const initListPermissions = createAction('PERMISSION_LIST_INIT');
const resolveListPermissions = createAction('PERMISSION_LIST_RESOLVE');
const rejectListPermissions = createAction('PERMISSION_LIST_REJECT');

const initCreatePermission = createAction('PERMISSION_CREATE_INIT');
const resolveCreatePermission = createAction('PERMISSION_CREATE_RESOLVE');
const rejectCreatePermission = createAction('PERMISSION_CREATE_REJECT');

const initUpdatePermission = createAction('PERMISSION_UPDATE_INIT');
const resolveUpdatePermission = createAction('PERMISSION_UPDATE_RESOLVE');
const rejectUpdatePermission = createAction('PERMISSION_UPDATE_REJECT');

const initDeletePermission = createAction('PERMISSION_DELETE_INIT');
const resolveDeletePermission = createAction('PERMISSION_DELETE_RESOLVE');
const rejectDeletePermission = createAction('PERMISSION_DELETE_REJECT');

export const setPermissionListLimit = createAction('PERMISSION_LIST_LIMIT_SET');
export const setPermissionListPage = createAction('PERMISSION_LIST_PAGE_SET');
export const setPermissionListFilters = createAction('PERMISSION_LIST_FILTERS_SET');

export const setPermissionUpdateRecord = createAction('PERMISSION_UPDATE_RECORD_SET');
export const clearPermissionUpdateForm = createAction('PERMISSION_UPDATE_FORM_CLEAR');
export const showPermissionUpdateForm = createAction('PERMISSION_UPDATE_FORM_SHOW');
export const hidePermissionUpdateForm = createAction('PERMISSION_UPDATE_FORM_HIDE');

export const setPermissionDeleteRecord = createAction('PERMISSION_DELETE_RECORD_SET');
export const clearPermissionDeleteForm = createAction('PERMISSION_DELETE_FORM_CLEAR');
export const showPermissionDeleteForm = createAction('PERMISSION_DELETE_FORM_SHOW');
export const hidePermissionDeleteForm = createAction('PERMISSION_DELETE_FORM_HIDE');

export const clearPermissionCreateForm = createAction('PERMISSION_CREATE_FORM_CLEAR');
export const showPermissionCreateForm = createAction('PERMISSION_CREATE_FORM_SHOW');
export const hidePermissionCreateForm = createAction('PERMISSION_CREATE_FORM_HIDE');

export const listPermissions = (props = {}) => (dispatch, getState) => {
  const { permission: store } = getState();

  dispatch(initListPermissions());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.list({
        limit: store.list.limit,
        cursor: store.list.cursors[store.list.page - 1],
        // If "Show system permissions" flag is set, send undefined to permission.list
        // so that everything is returned.
        isSystemPermission: store.list.filters.isSystemPermission ? undefined : false,
        q: store.list.filters.queryText || undefined,
        scope: store.list.filters.org.id,
        role: store.list.filters.role.id,
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

export const createPermission = (props) => (dispatch) => {
  dispatch(initCreatePermission());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.create({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(createPermission),
      })
    )
    .then((data) => {
      dispatch(resolveCreatePermission(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectCreatePermission(err));
      return false;
    });
};

export const updatePermission = (props) => (dispatch) => {
  dispatch(initUpdatePermission());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.update({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(updatePermission),
      })
    )
    .then((data) => {
      dispatch(resolveUpdatePermission(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectUpdatePermission(err));
      return false;
    });
};

export const deletePermission = (props) => (dispatch) => {
  dispatch(initDeletePermission());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.delete({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(deletePermission),
      })
    )
    .then((data) => {
      dispatch(resolveDeletePermission(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectDeletePermission(err));
      return false;
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
      if (action.payload.page < draft.list.page) {
        draft.list.cursors.length = action.payload.page;
      }
      draft.list.page = action.payload.page;
    }),
    [setPermissionListFilters]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.filters = {
        ...draft.list.filters,
        ...action.payload,
      };
    }),
    [initCreatePermission]: produce((draft) => {
      draft.create.isSavePending = true;
    }),
    [resolveCreatePermission]: produce((draft) => {
      draft.create.isSavePending = false;
    }),
    [rejectCreatePermission]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.create.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.create.errors = {
          generic: action.payload.message,
        };
      }
      draft.create.isSavePending = false;
    }),
    [clearPermissionCreateForm]: produce((draft) => {
      draft.create.errors = initialState.create.errors;
    }),
    [showPermissionCreateForm]: produce((draft) => {
      draft.create.isDisplayed = true;
    }),
    [hidePermissionCreateForm]: produce((draft) => {
      draft.create.isDisplayed = false;
    }),
    [initUpdatePermission]: produce((draft) => {
      draft.update.isSavePending = true;
    }),
    [resolveUpdatePermission]: produce((draft) => {
      draft.update.isSavePending = false;
    }),
    [rejectUpdatePermission]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.update.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.update.errors = {
          generic: action.payload.message,
        };
      }
      draft.update.isSavePending = false;
    }),
    [setPermissionUpdateRecord]: produce((draft, action) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = {
        ...draft.update.record,
        ...action.payload,
      };
    }),
    [clearPermissionUpdateForm]: produce((draft) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = initialState.update.record;
    }),
    [showPermissionUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = true;
    }),
    [hidePermissionUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = false;
    }),
    [initDeletePermission]: produce((draft) => {
      draft.delete.isDeletePending = true;
    }),
    [resolveDeletePermission]: produce((draft) => {
      draft.delete.isDeletePending = false;
    }),
    [rejectDeletePermission]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.delete.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.delete.errors = {
          generic: action.payload.message,
        };
      }
      draft.delete.isDeletePending = false;
    }),
    [setPermissionDeleteRecord]: produce((draft, action) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = action.payload;
    }),
    [clearPermissionDeleteForm]: produce((draft) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = initialState.delete.record;
    }),
    [showPermissionDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = true;
    }),
    [hidePermissionDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = false;
    }),
  },
  initialState
);
