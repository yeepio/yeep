import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
import yeepClient from '../yeepClient';
import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';
// import parseYeepValidationErrors from '../../utilities/parseYeepValidationErrors';

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
    },
  },
  form: {
    values: {
      name: '',
      slug: '',
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

const initListOrgs = createAction('ORG_LIST_INIT');
const resolveListOrgs = createAction('ORG_LIST_RESOLVE');
const rejectListOrgs = createAction('ORG_LIST_REJECT');

const initCreateOrg = createAction('ORG_CREATE_INIT');
const resolveCreateOrg = createAction('ORG_CREATE_RESOLVE');
const rejectCreateOrg = createAction('ORG_CREATE_REJECT');

const initDeleteOrg = createAction('ORG_DELETE_INIT');
const resolveDeleteOrg = createAction('ORG_DELETE_RESOLVE');
const rejectDeleteOrg = createAction('ORG_DELETE_REJECT');

export const setOrgListLimit = createAction('ORG_LIST_LIMIT_SET');
export const setOrgListPage = createAction('ORG_LIST_PAGE_SET');
export const setOrgListFilters = createAction('ORG_LIST_FILTERS_SET');

export const setOrgFormValues = createAction('ORG_FORM_VALUES_SET');
export const resetOrgFormValues = createAction('ORG_FORM_VALUES_CLEAR');

export const openOrgDeleteModal = createAction('ORG_DELETE_MODAL_OPEN');
export const closeOrgDeleteModal = createAction('ORG_DELETE_MODAL_CLOSE');

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
    [setOrgFormValues]: produce((draft, action) => {
      draft.form.errors = initialState.form.errors;
      draft.form.values = {
        ...draft.form.values,
        ...action.payload,
      };
    }),
    [resetOrgFormValues]: produce((draft) => {
      draft.form.errors = initialState.form.errors;
      draft.form.values = initialState.form.values;
    }),
    [openOrgDeleteModal]: produce((draft, action) => {
      draft.deletion.isOpen = true;
      draft.deletion.errors = initialState.deletion.errors;
      draft.deletion.record = action.payload.org;
    }),
    [closeOrgDeleteModal]: produce((draft) => {
      draft.deletion.isOpen = false;
    }),
    [initDeleteOrg]: produce((draft) => {
      draft.deletion.isDeletePending = true;
    }),
    [resolveDeleteOrg]: produce((draft) => {
      draft.deletion.isDeletePending = false;
    }),
    [rejectDeleteOrg]: produce((draft, action) => {
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
