import { createAction, handleActions } from 'redux-actions';
import { produce } from 'immer';
import yeepClient from '../yeepClient';
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
};

const initListOrgs = createAction('ORG_LIST_INIT');
const resolveListOrgs = createAction('ORG_LIST_RESOLVE');
const rejectListOrgs = createAction('ORG_LIST_REJECT');

export const setOrgListLimit = createAction('ORG_LIST_LIMIT_SET');
export const setOrgListPage = createAction('ORG_LIST_PAGE_SET');
export const setOrgListFilters = createAction('ORG_LIST_FILTERS_SET');

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
  },
  initialState
);
