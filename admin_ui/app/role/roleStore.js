import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
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
      isSystemRole: false,
      queryText: '',
      org: {},
    },
  },
  form: {
    values: {
      name: '',
      description: '',
      org: null,
      permissions: [],
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

const initDeleteRole = createAction('ROLE_DELETE_INIT');
const resolveDeleteRole = createAction('ROLE_DELETE_RESOLVE');
const rejectDeleteRole = createAction('ROLE_DELETE_REJECT');

export const setRoleFormValues = createAction('ROLE_FORM_VALUES_SET');
export const resetRoleFormValues = createAction('ROLE_FORM_VALUES_CLEAR');

export const openRoleDeleteModal = createAction('ROLE_DELETE_MODAL_OPEN');
export const closeRoleDeleteModal = createAction('ROLE_DELETE_MODAL_CLOSE');

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
      draft.form.isSavePending = true;
    }),
    [resolveCreateRole]: produce((draft) => {
      draft.form.isSavePending = false;
    }),
    [rejectCreateRole]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isSavePending = false;
    }),
    [initUpdateRole]: produce((draft) => {
      draft.form.isSavePending = true;
    }),
    [resolveUpdateRole]: produce((draft) => {
      draft.form.isSavePending = false;
    }),
    [rejectUpdateRole]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isSavePending = false;
    }),
    [initGetRoleInfo]: produce((draft) => {
      draft.form.isLoading = true;
    }),
    [resolveGetRoleInfo]: produce((draft) => {
      draft.form.isLoading = false;
    }),
    [rejectGetRoleInfo]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isLoading = false;
    }),
    [setRoleFormValues]: produce((draft, action) => {
      draft.form.errors = initialState.form.errors;
      draft.form.values = {
        ...draft.form.values,
        ...action.payload,
      };
    }),
    [resetRoleFormValues]: produce((draft) => {
      draft.form.errors = initialState.form.errors;
      draft.form.values = initialState.form.values;
    }),
    [openRoleDeleteModal]: produce((draft, action) => {
      draft.deletion.isOpen = true;
      draft.deletion.errors = initialState.deletion.errors;
      draft.deletion.record = action.payload.role;
    }),
    [closeRoleDeleteModal]: produce((draft) => {
      draft.deletion.isOpen = false;
    }),
    [initDeleteRole]: produce((draft) => {
      draft.deletion.isDeletePending = true;
    }),
    [resolveDeleteRole]: produce((draft) => {
      draft.deletion.isDeletePending = false;
    }),
    [rejectDeleteRole]: produce((draft, action) => {
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
