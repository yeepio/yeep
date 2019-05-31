import { createAction, handleActions } from 'redux-actions';

// initial state
export const initialState = {
  deleteModal: '',
};

// actions
export const setDeleteModal = createAction('SET_ORG_MODAL', (deleteModal) => {
  return { deleteModal };
});

// reducer
export const reducer = handleActions(
  {
    [setDeleteModal]: (state, action) => {
      return {
        ...state,
        deleteModal: action.payload.deleteModal,
      };
    },
  },
  initialState
);
