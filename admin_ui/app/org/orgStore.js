import { createAction, handleActions } from 'redux-actions';

// initial state
export const initialState = {
  displayedModal: '',
};

// actions
export const setDisplayedModal = createAction('SET_ORG_MODAL', (displayedModal) => {
  return { displayedModal };
});

// reducer
export const reducer = handleActions(
  {
    [setDisplayedModal]: (state, action) => {
      return {
        ...state,
        displayedModal: action.payload.displayedModal,
      };
    },
  },
  initialState
);
