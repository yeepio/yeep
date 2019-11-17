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
      isSystemRole: false,
      queryText: '',
      org: {},
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

const initListRoles = createAction('ROLE_LIST_INIT');
const resolveListRoles = createAction('ROLE_LIST_RESOLVE');
const rejectListRoles = createAction('ROLE_LIST_REJECT');

const initCreateRole = createAction('ROLE_CREATE_INIT');
const resolveCreateRole = createAction('ROLE_CREATE_RESOLVE');
const rejectCreateRole = createAction('ROLE_CREATE_REJECT');

const initUpdateRole = createAction('ROLE_UPDATE_INIT');
const resolveUpdateRole = createAction('ROLE_UPDATE_RESOLVE');
const rejectUpdateRole = createAction('ROLE_UPDATE_REJECT');

const initDeleteRole = createAction('ROLE_DELETE_INIT');
const resolveDeleteRole = createAction('ROLE_DELETE_RESOLVE');
const rejectDeleteRole = createAction('ROLE_DELETE_REJECT');

export const setRoleListLimit = createAction('ROLE_LIST_LIMIT_SET');
export const setRoleListPage = createAction('ROLE_LIST_PAGE_SET');
export const setRoleListFilters = createAction('ROLE_LIST_FILTERS_SET');

export const setRoleUpdateRecord = createAction('ROLE_UPDATE_RECORD_SET');
export const clearRoleUpdateForm = createAction('ROLE_UPDATE_FORM_CLEAR');
export const showRoleUpdateForm = createAction('ROLE_UPDATE_FORM_SHOW');
export const hideRoleUpdateForm = createAction('ROLE_UPDATE_FORM_HIDE');

export const setRoleDeleteRecord = createAction('ROLE_DELETE_RECORD_SET');
export const clearRoleDeleteForm = createAction('ROLE_DELETE_FORM_CLEAR');
export const showRoleDeleteForm = createAction('ROLE_DELETE_FORM_SHOW');
export const hideRoleDeleteForm = createAction('ROLE_DELETE_FORM_HIDE');

export const clearRoleCreateForm = createAction('ROLE_CREATE_FORM_CLEAR');
export const showRoleCreateForm = createAction('ROLE_CREATE_FORM_SHOW');
export const hideRoleCreateForm = createAction('ROLE_CREATE_FORM_HIDE');

export const listRoles = (props = {}) => (dispatch, getState) => {
  const { role: store } = getState();

  dispatch(initListRoles());
  return yeepClient
    .api()
    .then((api) => {
      return api.role.list({
        limit: store.list.limit,
        cursor: store.list.cursors[store.list.page - 1],
        isSystemRole: store.list.filters.isSystemRole,
        q: store.list.filters.queryText || undefined,
        scope: store.list.filters.org.id,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listRoles),
        ...props,
      });
    })
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

// export const getRoleInfo = (props) => (dispatch) => {
//   dispatch(initGetRoleInfo());
//   return yeepClient
//     .api()
//     .then((api) =>
//       api.role.info({
//         ...props,
//         cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getRoleInfo),
//       })
//     )
//     .then((data) => {
//       dispatch(resolveGetRoleInfo(data));
//       return data.role;
//     })
//     .catch((err) => {
//       dispatch(rejectGetRoleInfo(err));
//       return null;
//     });
// };

export const deleteRole = (props) => (dispatch) => {
  dispatch(initDeleteRole());
  return yeepClient
    .api()
    .then((api) =>
      api.role.delete({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(deleteRole),
      })
    )
    .then((data) => {
      dispatch(resolveDeleteRole(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectDeleteRole(err));
      return false;
    });
};

export const reducer = handleActions(
  {
    [initListRoles]: produce((draft) => {
      draft.list.isLoading = true;
    }),
    [resolveListRoles]: produce((draft, action) => {
      draft.list.isLoading = false;
      draft.list.records = action.payload.roles;
      draft.list.cursors.push(action.payload.nextCursor);
      draft.list.totalCount = action.payload.roleCount;
    }),
    [setRoleListLimit]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.limit = action.payload.limit;
    }),
    [setRoleListPage]: produce((draft, action) => {
      if (action.payload.page < draft.list.page) {
        draft.list.cursors.length = action.payload.page;
      }
      draft.list.page = action.payload.page;
    }),
    [setRoleListFilters]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.filters = {
        ...draft.list.filters,
        ...action.payload,
      };
    }),
    [initCreateRole]: produce((draft) => {
      draft.create.isSavePending = true;
    }),
    [resolveCreateRole]: produce((draft) => {
      draft.create.isSavePending = false;
    }),
    [rejectCreateRole]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.create.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.create.errors = {
          generic: action.payload.message,
        };
      }
      draft.create.isSavePending = false;
    }),
    [clearRoleCreateForm]: produce((draft) => {
      draft.create.errors = initialState.create.errors;
    }),
    [showRoleCreateForm]: produce((draft) => {
      draft.create.isDisplayed = true;
    }),
    [hideRoleCreateForm]: produce((draft) => {
      draft.create.isDisplayed = false;
    }),
    [initUpdateRole]: produce((draft) => {
      draft.update.isSavePending = true;
    }),
    [resolveUpdateRole]: produce((draft) => {
      draft.update.isSavePending = false;
    }),
    [rejectUpdateRole]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.update.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.update.errors = {
          generic: action.payload.message,
        };
      }
      draft.update.isSavePending = false;
    }),
    [setRoleUpdateRecord]: produce((draft, action) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = {
        ...draft.update.record,
        ...action.payload,
      };
    }),
    [clearRoleUpdateForm]: produce((draft) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = initialState.update.record;
    }),
    [showRoleUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = true;
    }),
    [hideRoleUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = false;
    }),
    [initDeleteRole]: produce((draft) => {
      draft.delete.isDeletePending = true;
    }),
    [resolveDeleteRole]: produce((draft) => {
      draft.delete.isDeletePending = false;
    }),
    [rejectDeleteRole]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.delete.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.delete.errors = {
          generic: action.payload.message,
        };
      }
      draft.delete.isDeletePending = false;
    }),
    [setRoleDeleteRecord]: produce((draft, action) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = action.payload;
    }),
    [clearRoleDeleteForm]: produce((draft) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = initialState.delete.record;
    }),
    [showRoleDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = true;
    }),
    [hideRoleDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = false;
    }),
  },
  initialState
);
