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
      queryText: '',
      org: {},
    },
  },
  info: {
    record: {},
  },
  create: {
    isDisplayed: false,
    isSavePending: false,
    errors: {},
  },
  update: {
    record: {},
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

const initListUsers = createAction('USER_LIST_INIT');
const resolveListUsers = createAction('USER_LIST_RESOLVE');
const rejectListUsers = createAction('USER_LIST_REJECT');

const initCreateUser = createAction('USER_CREATE_INIT');
const resolveCreateUser = createAction('USER_CREATE_RESOLVE');
const rejectCreateUser = createAction('USER_CREATE_REJECT');

const initDeleteUser = createAction('USER_DELETE_INIT');
const resolveDeleteUser = createAction('USER_DELETE_RESOLVE');
const rejectDeleteUser = createAction('USER_DELETE_REJECT');

const initUpdateUser = createAction('USER_UPDATE_INIT');
const resolveUpdateUser = createAction('USER_UPDATE_RESOLVE');
const rejectUpdateUser = createAction('USER_UPDATE_REJECT');

const initGetUserInfo = createAction('USER_INFO_INIT');
const resolveGetUserInfo = createAction('USER_INFO_RESOLVE');
const rejectGetUserInfo = createAction('USER_INFO_REJECT');

export const setUserListLimit = createAction('USER_LIST_LIMIT_SET');
export const setUserListPage = createAction('USER_LIST_PAGE_SET');
export const setUserListFilters = createAction('USER_LIST_FILTERS_SET');

export const setUserUpdateRecord = createAction('USER_UPDATE_RECORD_SET');
export const clearUserUpdateForm = createAction('USER_UPDATE_FORM_CLEAR');
export const showUserUpdateForm = createAction('USER_UPDATE_FORM_SHOW');
export const hideUserUpdateForm = createAction('USER_UPDATE_FORM_HIDE');

export const setUserDeleteRecord = createAction('USER_DELETE_RECORD_SET');
export const clearUserDeleteForm = createAction('USER_DELETE_FORM_CLEAR');
export const showUserDeleteForm = createAction('USER_DELETE_FORM_SHOW');
export const hideUserDeleteForm = createAction('USER_DELETE_FORM_HIDE');

export const clearUserCreateForm = createAction('USER_CREATE_FORM_CLEAR');
export const showUserCreateForm = createAction('USER_CREATE_FORM_SHOW');
export const hideUserCreateForm = createAction('USER_CREATE_FORM_HIDE');

export const listUsers = (props = {}) => (dispatch, getState) => {
  const { user: store } = getState();

  dispatch(initListUsers());
  return yeepClient
    .api()
    .then((api) =>
      api.user.list({
        limit: store.list.limit,
        cursor: store.list.cursors[store.list.page - 1],
        q: store.list.filters.queryText || undefined,
        org: store.list.filters.org.id,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listUsers),
        ...props,
      })
    )
    .then((data) => {
      dispatch(resolveListUsers(data));
      return data.users;
    })
    .catch((err) => {
      dispatch(rejectListUsers(err));
      return null;
    });
};

export const createUser = (props) => (dispatch) => {
  dispatch(initCreateUser());
  return yeepClient
    .api()
    .then((api) =>
      api.user.create({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(createUser),
      })
    )
    .then((data) => {
      dispatch(resolveCreateUser(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectCreateUser(err));
      return false;
    });
};

export const deleteUser = (props) => (dispatch) => {
  dispatch(initDeleteUser());
  return yeepClient
    .api()
    .then((api) =>
      api.user.delete({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(deleteUser),
      })
    )
    .then((data) => {
      dispatch(resolveDeleteUser(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectDeleteUser(err));
      return false;
    });
};

export const updateUser = (props) => (dispatch) => {
  dispatch(initUpdateUser());
  return yeepClient
    .api()
    .then((api) =>
      api.user.update({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(updateUser),
      })
    )
    .then((data) => {
      dispatch(resolveUpdateUser(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectUpdateUser(err));
      return false;
    });
};

export const getUserInfo = (props) => (dispatch) => {
  dispatch(initGetUserInfo());
  return yeepClient
    .api()
    .then((api) =>
      api.user.info({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getUserInfo),
      })
    )
    .then((data) => {
      dispatch(resolveGetUserInfo(data));
      return data.user;
    })
    .catch((err) => {
      dispatch(rejectGetUserInfo(err));
      return null;
    });
};

export const reducer = handleActions(
  {
    [initListUsers]: produce((draft) => {
      draft.list.isLoading = true;
    }),
    [resolveListUsers]: produce((draft, action) => {
      draft.list.isLoading = false;
      draft.list.records = action.payload.users;
      draft.list.cursors.push(action.payload.nextCursor);
      draft.list.totalCount = action.payload.usersCount;
    }),
    [setUserListLimit]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.limit = action.payload.limit;
    }),
    [setUserListPage]: produce((draft, action) => {
      if (action.payload.page < draft.list.page) {
        draft.list.cursors.length = action.payload.page;
      }
      draft.list.page = action.payload.page;
    }),
    [setUserListFilters]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.filters = {
        ...draft.list.filters,
        ...action.payload,
      };
    }),
    [initCreateUser]: produce((draft) => {
      draft.form.isSavePending = true;
    }),
    [resolveCreateUser]: produce((draft) => {
      draft.form.isSavePending = false;
    }),
    [rejectCreateUser]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isSavePending = false;
    }),
    [clearUserCreateForm]: produce((draft) => {
      draft.create.errors = initialState.create.errors;
    }),
    [showUserCreateForm]: produce((draft) => {
      draft.create.isDisplayed = true;
    }),
    [hideUserCreateForm]: produce((draft) => {
      draft.create.isDisplayed = false;
    }),
    [initUpdateUser]: produce((draft) => {
      draft.update.isSavePending = true;
    }),
    [resolveUpdateUser]: produce((draft) => {
      draft.update.isSavePending = false;
    }),
    [rejectUpdateUser]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.update.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.update.errors = {
          generic: action.payload.message,
        };
      }
      draft.update.isSavePending = false;
    }),
    [setUserUpdateRecord]: produce((draft, action) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = {
        ...draft.update.record,
        ...action.payload,
      };
    }),
    [clearUserUpdateForm]: produce((draft) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = initialState.update.record;
    }),
    [showUserUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = true;
    }),
    [hideUserUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = false;
    }),
    [initDeleteUser]: produce((draft) => {
      draft.delete.isDeletePending = true;
    }),
    [resolveDeleteUser]: produce((draft) => {
      draft.delete.isDeletePending = false;
    }),
    [rejectDeleteUser]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.delete.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.delete.errors = {
          generic: action.payload.message,
        };
      }
      draft.delete.isDeletePending = false;
    }),
    [setUserDeleteRecord]: produce((draft, action) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = action.payload;
    }),
    [clearUserDeleteForm]: produce((draft) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = initialState.delete.record;
    }),
    [showUserDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = true;
    }),
    [hideUserDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = false;
    }),
    [initGetUserInfo]: produce((draft) => {
      draft.form.isLoading = true;
    }),
    [resolveGetUserInfo]: produce((draft, action) => {
      draft.form.isLoading = false;
      draft.form.values = action.payload.user;
    }),
    [rejectGetUserInfo]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isLoading = false;
    }),
  },
  initialState
);
