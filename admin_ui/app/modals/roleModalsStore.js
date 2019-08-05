import { createAction, handleActions } from 'redux-actions';
import noop from 'lodash/noop';
import yeepClient from '../yeepClient';

// initial state of the modal store
export const initialState = {
  // A flag to establish the currently showing modal
  // Possible values: ['ROLE_CREATE', 'ROLE_DELETE']
  displayedModal: '',
  // role-related entries
  role: {},
  roleCreateError: '',
  roleEditError: '',
  roleDeleteError: '',
  isroleCreatePending: false,
  isroleEditPending: false,
  isroleDeletePending: false,
};

export const callbacks = {
  onRoleCreateSubmit: noop,
  onRoleCreateCancel: noop,
  onRoleEditSubmit: noop,
  onRoleEditCancel: noop,
  onRoleDeleteSubmit: noop,
  onRoleDeleteCancel: noop,
};

// ACTIONS

// ****************************************************************************
// ROLE CREATE
// ****************************************************************************
export const openRoleCreateModal = createAction(
  'ROLE_CREATE_MODAL_OPEN',
  (onSubmit = noop, onCancel = noop) => {
    return {
      onSubmit,
      onCancel,
    };
  }
);
export const closeRoleCreateModal = createAction('ROLE_CREATE_MODAL_CLOSE');
const initRoleCreate = createAction('ROLE_CREATE_INIT');
const resolveRoleCreate = createAction('ROLE_CREATE_RESOLVE');
const rejectRoleCreate = createAction('ROLE_CREATE_REJECT', (err) => {
  return { err };
});
const mockRoleCreateApiRequest = (role) => {
  return new Promise((resolve) => {
    // Fake async
    setTimeout(() => {
      console.log(`Created role ${role.name}`);
      resolve();
    }, 2000);
  });
};
export const createRole = (role) => (dispatch) => {
  dispatch(initRoleCreate());
  mockRoleCreateApiRequest(role)
    .then(() => dispatch(resolveRoleCreate()))
    .catch((err) => dispatch(rejectRoleCreate(err)));
};

// ****************************************************************************
// ROLE EDIT
// ****************************************************************************
export const openRoleEditModal = createAction(
  'ROLE_EDIT_MODAL_OPEN',
  (role, onSubmit = noop, onCancel = noop) => {
    return {
      role,
      onSubmit,
      onCancel,
    };
  }
);
export const closeRoleEditModal = createAction('ROLE_EDIT_MODAL_CLOSE');
const initRoleEdit = createAction('ROLE_EDIT_INIT');
const resolveRoleEdit = createAction('ROLE_EDIT_RESOLVE');
const rejectRoleEdit = createAction('ROLE_EDIT_REJECT', (err) => {
  return { err };
});
const mockRoleEditApiRequest = (id) => {
  return new Promise((resolve) => {
    // Fake async
    setTimeout(() => {
      console.log(`Updated role ${id}`);
      resolve();
    }, 2000);
  });
};
export const editRole = (role) => (dispatch) => {
  dispatch(initRoleEdit());
  mockRoleEditApiRequest(role.id)
    .then(() => dispatch(resolveRoleEdit()))
    .catch((err) => dispatch(rejectRoleEdit(err)));
};

// ****************************************************************************
// ROLE DELETE
// ****************************************************************************
export const openRoleDeleteModal = createAction(
  'ROLE_DELETE_MODAL_OPEN',
  (role, onSubmit = noop, onCancel = noop) => {
    return {
      role,
      onSubmit,
      onCancel,
    };
  }
);
export const closeRoleDeleteModal = createAction('ROLE_DELETE_MODAL_CLOSE');
const initRoleDelete = createAction('ROLE_DELETE_INIT');
const resolveRoleDelete = createAction('ROLE_DELETE_RESOLVE');
const rejectRoleDelete = createAction('ROLE_DELETE_REJECT', (err) => {
  return { err };
});
// const mockRoleDeleteApiRequest = (id) => {
//   return new Promise((resolve) => {
//     // Fake async
//     setTimeout(() => {
//       console.log(`Deleted role ${id}`);
//       resolve();
//     }, 2000);
//   });
// };
export const deleteRole = (props) => (dispatch) => {
  dispatch(initRoleDelete());
  return yeepClient
    .api()
    .then((api) =>
      api.role.delete({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(deleteRole),
      })
    )
    .then((data) => {
      dispatch(resolveRoleDelete(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectRoleDelete(err));
      return false;
    });
};

// reducer
export const reducer = handleActions(
  {
    // Create role
    [openRoleCreateModal]: (state, action) => {
      callbacks.onRoleCreateCancel = action.payload.onCancel;
      callbacks.onRoleCreateSubmit = action.payload.onSubmit;
      return {
        ...state,
        displayedModal: 'ROLE_CREATE'
      };
    },
    [closeRoleCreateModal]: (state) => {
      callbacks.onRoleCreateCancel = noop;
      callbacks.onRoleCreateSubmit = noop;
      return {
        ...state,
        displayedModal: '',
        role: {},
        roleCreateError: '',
        isRoleCreatePending: false,
      };
    },
    [initRoleCreate]: (state) => {
      return {
        ...state,
        roleCreateError: '',
        isRoleCreatePending: true,
      };
    },
    [resolveRoleCreate]: (state) => {
      return {
        ...state,
        isRoleCreatePending: false,
      };
    },
    [rejectRoleCreate]: (state, action) => {
      return {
        ...state,
        roleCreateError: action.payload.err,
        isRoleCreatePending: false,
      };
    },
    // Edit role
    [openRoleEditModal]: (state, action) => {
      callbacks.onRoleEditCancel = action.payload.onCancel;
      callbacks.onRoleEditSubmit = action.payload.onSubmit;
      return {
        ...state,
        displayedModal: 'ROLE_EDIT',
        role: action.payload.role,
      };
    },
    [closeRoleEditModal]: (state) => {
      callbacks.onRoleEditCancel = noop;
      callbacks.onRoleEditSubmit = noop;
      return {
        ...state,
        displayedModal: '',
        role: {},
        roleEditError: '',
        isRoleEditPending: false,
      };
    },
    [initRoleEdit]: (state) => {
      return {
        ...state,
        roleEditError: '',
        isRoleEditPending: true,
      };
    },
    [resolveRoleEdit]: (state) => {
      return {
        ...state,
        isRoleEditPending: false,
      };
    },
    [rejectRoleEdit]: (state, action) => {
      return {
        ...state,
        roleEditError: action.payload.err,
        isRoleEditPending: false,
      };
    },
    // Delete role
    [openRoleDeleteModal]: (state, action) => {
      callbacks.onRoleDeleteCancel = action.payload.onCancel;
      callbacks.onRoleDeleteSubmit = action.payload.onSubmit;
      return {
        ...state,
        displayedModal: 'ROLE_DELETE',
        role: action.payload.role,
      };
    },
    [closeRoleDeleteModal]: (state) => {
      callbacks.onRoleDeleteCancel = noop;
      callbacks.onRoleDeleteSubmit = noop;
      return {
        ...state,
        displayedModal: '',
        role: {},
        roleDeleteError: '',
        isRoleDeletePending: false,
      };
    },
    [initRoleDelete]: (state) => {
      return {
        ...state,
        roleDeleteError: '',
        isRoleDeletePending: true,
      };
    },
    [resolveRoleDelete]: (state) => {
      return {
        ...state,
        isRoleDeletePending: false,
      };
    },
    [rejectRoleDelete]: (state, action) => {
      return {
        ...state,
        roleDeleteError: action.payload.err,
        isRoleDeletePending: false,
      };
    },
  },
  initialState
);