import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
import yeepClient from '../yeepClient';
import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';
// import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';

// initial state
export const initialState = {
  list: {
    records: [],
    // Initialise to "null" cause 0 is actually meaningfull
    totalCount: null,
    limit: 10,
    isLoading: false,
    cursors: [],
    page: 0,
    filters: {
      queryText: '',
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

const initListOrgs = createAction('ORG_LIST_INIT');
const resolveListOrgs = createAction('ORG_LIST_RESOLVE');
const rejectListOrgs = createAction('ORG_LIST_REJECT');

const initCreateOrg = createAction('ORG_CREATE_INIT');
const resolveCreateOrg = createAction('ORG_CREATE_RESOLVE');
const rejectCreateOrg = createAction('ORG_CREATE_REJECT');

const initDeleteOrg = createAction('ORG_DELETE_INIT');
const resolveDeleteOrg = createAction('ORG_DELETE_RESOLVE');
const rejectDeleteOrg = createAction('ORG_DELETE_REJECT');

const initUpdateOrg = createAction('ORG_UPDATE_INIT');
const resolveUpdateOrg = createAction('ORG_UPDATE_RESOLVE');
const rejectUpdateOrg = createAction('ORG_UPDATE_REJECT');

const initGetOrgInfo = createAction('ORG_INFO_INIT');
const resolveGetOrgInfo = createAction('ORG_INFO_RESOLVE');
const rejectGetOrgInfo = createAction('ORG_INFO_REJECT');

export const setOrgListLimit = createAction('ORG_LIST_LIMIT_SET');
export const setOrgListPage = createAction('ORG_LIST_PAGE_SET');
export const setOrgListFilters = createAction('ORG_LIST_FILTERS_SET');

export const setOrgUpdateRecord = createAction('ORG_UPDATE_RECORD_SET');
export const clearOrgUpdateForm = createAction('ORG_UPDATE_FORM_CLEAR');
export const showOrgUpdateForm = createAction('ORG_UPDATE_FORM_SHOW');
export const hideOrgUpdateForm = createAction('ORG_UPDATE_FORM_HIDE');

export const setOrgDeleteRecord = createAction('ORG_DELETE_RECORD_SET');
export const clearOrgDeleteForm = createAction('ORG_DELETE_FORM_CLEAR');
export const showOrgDeleteForm = createAction('ORG_DELETE_FORM_SHOW');
export const hideOrgDeleteForm = createAction('ORG_DELETE_FORM_HIDE');

export const clearOrgCreateForm = createAction('ORG_CREATE_FORM_CLEAR');
export const showOrgCreateForm = createAction('ORG_CREATE_FORM_SHOW');
export const hideOrgCreateForm = createAction('ORG_CREATE_FORM_HIDE');

export const listOrgs = (props = {}) => (dispatch, getState) => {
  const { org: store } = getState();

  dispatch(initListOrgs());
  return yeepClient
    .api()
    .then((api) =>
      api.org.list({
        limit: store.list.limit,
        cursor: store.list.cursors[store.list.page - 1],
        q: store.list.filters.queryText || undefined,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(listOrgs),
        ...props,
      })
    )
    .then((data) => {
      dispatch(resolveListOrgs(data));
      return data.orgs;
    })
    .catch((err) => {
      dispatch(rejectListOrgs(err));
      return null;
    });
};

export const createOrg = (props) => (dispatch) => {
  dispatch(initCreateOrg());
  return yeepClient
    .api()
    .then((api) =>
      api.org.create({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(createOrg),
      })
    )
    .then((data) => {
      dispatch(resolveCreateOrg(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectCreateOrg(err));
      return false;
    });
};

export const deleteOrg = (props) => (dispatch) => {
  dispatch(initDeleteOrg());
  return yeepClient
    .api()
    .then((api) =>
      api.org.delete({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(deleteOrg),
      })
    )
    .then((data) => {
      dispatch(resolveDeleteOrg(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectDeleteOrg(err));
      return false;
    });
};

export const updateOrg = (props) => (dispatch) => {
  dispatch(initUpdateOrg());
  return yeepClient
    .api()
    .then((api) =>
      api.org.update({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(updateOrg),
      })
    )
    .then((data) => {
      dispatch(resolveUpdateOrg(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectUpdateOrg(err));
      return false;
    });
};

export const getOrgInfo = (props) => (dispatch) => {
  dispatch(initGetOrgInfo());
  return yeepClient
    .api()
    .then((api) =>
      api.org.info({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getOrgInfo),
      })
    )
    .then((data) => {
      dispatch(resolveGetOrgInfo(data));
      return data.org;
    })
    .catch((err) => {
      dispatch(rejectGetOrgInfo(err));
      return null;
    });
};

export const reducer = handleActions(
  {
    [initListOrgs]: produce((draft) => {
      draft.list.isLoading = true;
    }),
    [resolveListOrgs]: produce((draft, action) => {
      draft.list.isLoading = false;
      draft.list.records = action.payload.orgs;
      draft.list.cursors.push(action.payload.nextCursor);
      draft.list.totalCount = action.payload.orgsCount;
    }),
    [setOrgListLimit]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.limit = action.payload.limit;
    }),
    [setOrgListPage]: produce((draft, action) => {
      if (action.payload.page < draft.list.page) {
        draft.list.cursors.length = action.payload.page;
      }
      draft.list.page = action.payload.page;
    }),
    [setOrgListFilters]: produce((draft, action) => {
      draft.list.page = 0;
      draft.list.cursors = [];
      draft.list.filters = {
        ...draft.list.filters,
        ...action.payload,
      };
    }),
    [initCreateOrg]: produce((draft) => {
      draft.form.isSavePending = true;
    }),
    [resolveCreateOrg]: produce((draft) => {
      draft.form.isSavePending = false;
    }),
    [rejectCreateOrg]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.form.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.form.errors = {
          generic: action.payload.message,
        };
      }
      draft.form.isSavePending = false;
    }),
    [clearOrgCreateForm]: produce((draft) => {
      draft.create.errors = initialState.create.errors;
    }),
    [showOrgCreateForm]: produce((draft) => {
      draft.create.isDisplayed = true;
    }),
    [hideOrgCreateForm]: produce((draft) => {
      draft.create.isDisplayed = false;
    }),
    [initUpdateOrg]: produce((draft) => {
      draft.update.isSavePending = true;
    }),
    [resolveUpdateOrg]: produce((draft) => {
      draft.update.isSavePending = false;
    }),
    [rejectUpdateOrg]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.update.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.update.errors = {
          generic: action.payload.message,
        };
      }
      draft.update.isSavePending = false;
    }),
    [setOrgUpdateRecord]: produce((draft, action) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = {
        ...draft.update.record,
        ...action.payload,
      };
    }),
    [clearOrgUpdateForm]: produce((draft) => {
      draft.update.errors = initialState.update.errors;
      draft.update.record = initialState.update.record;
    }),
    [showOrgUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = true;
    }),
    [hideOrgUpdateForm]: produce((draft) => {
      draft.update.isDisplayed = false;
    }),
    [initDeleteOrg]: produce((draft) => {
      draft.delete.isDeletePending = true;
    }),
    [resolveDeleteOrg]: produce((draft) => {
      draft.delete.isDeletePending = false;
    }),
    [rejectDeleteOrg]: produce((draft, action) => {
      if (action.payload.code === 400) {
        draft.delete.errors = parseYeepValidationErrors(action.payload);
      } else {
        draft.delete.errors = {
          generic: action.payload.message,
        };
      }
      draft.delete.isDeletePending = false;
    }),
    [setOrgDeleteRecord]: produce((draft, action) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = action.payload;
    }),
    [clearOrgDeleteForm]: produce((draft) => {
      draft.delete.errors = initialState.delete.errors;
      draft.delete.record = initialState.delete.record;
    }),
    [showOrgDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = true;
    }),
    [hideOrgDeleteForm]: produce((draft) => {
      draft.delete.isDisplayed = false;
    }),
    [initGetOrgInfo]: produce((draft) => {
      draft.form.isLoading = true;
    }),
    [resolveGetOrgInfo]: produce((draft, action) => {
      draft.form.isLoading = false;
      draft.form.values = action.payload.org;
    }),
    [rejectGetOrgInfo]: produce((draft, action) => {
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
