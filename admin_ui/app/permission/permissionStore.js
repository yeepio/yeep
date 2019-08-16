import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
import get from 'lodash/get';
import yeepClient from '../yeepClient';
import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';

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
    values: {
      name: '',
      description: '',
      org: null,
    },
    isLoading: false,
    isSavePending: false,
    errors: {},
  },
  deletion: {
    record: {},
    isOpen: false,
    isDeletePending: false,
    errors: {},
  },
};

const initListPermissions = createAction('PERMISSION_LIST_INIT');
const resolveListPermissions = createAction('PERMISSION_LIST_RESOLVE');
const rejectListPermissions = createAction('PERMISSION_LIST_REJECT');

export const setPermissionListLimit = createAction('PERMISSION_LIST_LIMIT_SET');
export const setPermissionListPage = createAction('PERMISSION_LIST_PAGE_SET');
export const setPermissionListFilters = createAction('PERMISSION_LIST_FILTERS_SET');

const initCreatePermission = createAction('PERMISSION_CREATE_INIT');
const resolveCreatePermission = createAction('PERMISSION_CREATE_RESOLVE');
const rejectCreatePermission = createAction('PERMISSION_CREATE_REJECT');

const initUpdatePermission = createAction('PERMISSION_UPDATE_INIT');
const resolveUpdatePermission = createAction('PERMISSION_UPDATE_RESOLVE');
const rejectUpdatePermission = createAction('PERMISSION_UPDATE_REJECT');

const initGetPermissionInfo = createAction('PERMISSION_INFO_INIT');
const resolveGetPermissionInfo = createAction('PERMISSION_INFO_RESOLVE');
const rejectGetPermissionInfo = createAction('PERMISSION_INFO_REJECT');

const initDeletePermission = createAction('PERMISSION_DELETE_INIT');
const resolveDeletePermission = createAction('PERMISSION_DELETE_RESOLVE');
const rejectDeletePermission = createAction('PERMISSION_DELETE_REJECT');

export const setPermissionFormValues = createAction('PERMISSION_FORM_VALUES_SET');
export const resetPermissionFormValues = createAction('PERMISSION_FORM_VALUES_CLEAR');

export const openPermissionDeleteModal = createAction('PERMISSION_DELETE_MODAL_OPEN');
export const closePermissionDeleteModal = createAction('PERMISSION_DELETE_MODAL_CLOSE');

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

export const getPermissionInfo = (props) => (dispatch) => {
  dispatch(initGetPermissionInfo());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.info({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getPermissionInfo),
      })
    )
    .then((data) => {
      dispatch(resolveGetPermissionInfo(data));
      return data.permission;
    })
    .catch((err) => {
      dispatch(rejectGetPermissionInfo(err));
      return null;
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
      draft.list.filters = {
        ...draft.list.filters,
        ...action.payload,
      };
    }),
    [initCreatePermission]: produce((draft) => {
      draft.form.isSavePending = true;
    }),
    [resolveCreatePermission]: produce((draft) => {
      draft.form.isSavePending = false;
    }),
    [rejectCreatePermission]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isSavePending = false;
    }),
    [initUpdatePermission]: produce((draft) => {
      draft.form.isSavePending = true;
    }),
    [resolveUpdatePermission]: produce((draft) => {
      draft.form.isSavePending = false;
    }),
    [rejectUpdatePermission]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isSavePending = false;
    }),
    [initGetPermissionInfo]: produce((draft) => {
      draft.form.isLoading = true;
    }),
    [resolveGetPermissionInfo]: produce((draft) => {
      draft.form.isLoading = false;
    }),
    [rejectGetPermissionInfo]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isLoading = false;
    }),
    [setPermissionFormValues]: produce((draft, action) => {
      draft.form.errors = initialState.form.errors;
      draft.form.values = {
        ...draft.form.values,
        ...action.payload,
      };
    }),
    [resetPermissionFormValues]: produce((draft) => {
      draft.form.errors = initialState.form.errors;
      draft.form.values = initialState.form.values;
    }),
    [openPermissionDeleteModal]: produce((draft, action) => {
      draft.deletion.isOpen = true;
      draft.deletion.errors = initialState.deletion.errors;
      draft.deletion.record = action.payload.permission;
    }),
    [closePermissionDeleteModal]: produce((draft) => {
      draft.deletion.isOpen = false;
    }),
    [initDeletePermission]: produce((draft) => {
      draft.deletion.isDeletePending = true;
    }),
    [resolveDeletePermission]: produce((draft) => {
      draft.deletion.isDeletePending = false;
    }),
    [rejectDeletePermission]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.deletion.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.deletion.errors = {
          generic: action.payload.message,
        };
      }
      draft.deletion.isDeletePending = false;
    }),
  },
  initialState
);
