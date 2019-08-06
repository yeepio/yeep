import { createAction, handleActions } from 'redux-actions';
import noop from 'lodash/noop';
import yeepClient from '../yeepClient';

// initial state of the modal store
export const initialState = {
  // A flag to establish the currently showing modal
  // Possible values: ['PERMISSION_CREATE', 'PERMISSION_DELETE']
  displayedModal: '',
  // Permission-related entries
  permission: {},
  permissionCreateError: '',
  permissionEditError: '',
  permissionDeleteError: '',
  isPermissionCreatePending: false,
  isPermissionEditPending: false,
  isPermissionDeletePending: false,
};

export const callbacks = {
  onPermissionCreateSubmit: noop,
  onPermissionCreateCancel: noop,
  onPermissionEditSubmit: noop,
  onPermissionEditCancel: noop,
  onPermissionDeleteSubmit: noop,
  onPermissionDeleteCancel: noop,
};

// ACTIONS

// ****************************************************************************
// Permission CREATE
// ****************************************************************************
export const openPermissionCreateModal = createAction(
  'PERMISSION_CREATE_MODAL_OPEN',
  (onSubmit = noop, onCancel = noop) => {
    return {
      onSubmit,
      onCancel,
    };
  }
);
export const closePermissionCreateModal = createAction('PERMISSION_CREATE_MODAL_CLOSE');
const initPermissionCreate = createAction('PERMISSION_CREATE_INIT');
const resolvePermissionCreate = createAction('PERMISSION_CREATE_RESOLVE');
const rejectPermissionCreate = createAction('PERMISSION_CREATE_REJECT', (err) => {
  return { err };
});
const mockPermissionCreateApiRequest = (permission) => {
  return new Promise((resolve) => {
    // Fake async
    setTimeout(() => {
      console.log(`Created permission ${permission.name}`);
      resolve();
    }, 2000);
  });
};
export const createPermission = (permission) => (dispatch) => {
  dispatch(initPermissionCreate());
  mockPermissionCreateApiRequest(permission)
    .then(() => dispatch(resolvePermissionCreate()))
    .catch((err) => dispatch(rejectPermissionCreate(err)));
};

// ****************************************************************************
// Permission EDIT
// ****************************************************************************
export const openPermissionEditModal = createAction(
  'PERMISSION_EDIT_MODAL_OPEN',
  (permission, onSubmit = noop, onCancel = noop) => {
    return {
      permission,
      onSubmit,
      onCancel,
    };
  }
);
export const closePermissionEditModal = createAction('PERMISSION_EDIT_MODAL_CLOSE');
const initPermissionEdit = createAction('PERMISSION_EDIT_INIT');
const resolvePermissionEdit = createAction('PERMISSION_EDIT_RESOLVE');
const rejectPermissionEdit = createAction('PERMISSION_EDIT_REJECT', (err) => {
  return { err };
});
const mockPermissionEditApiRequest = (id) => {
  return new Promise((resolve) => {
    // Fake async
    setTimeout(() => {
      console.log(`Updated permission ${id}`);
      resolve();
    }, 2000);
  });
};
export const editPermission = (permission) => (dispatch) => {
  dispatch(initPermissionEdit());
  mockPermissionEditApiRequest(permission.id)
    .then(() => dispatch(resolvePermissionEdit()))
    .catch((err) => dispatch(rejectPermissionEdit(err)));
};

// ****************************************************************************
// Permission DELETE
// ****************************************************************************
export const openPermissionDeleteModal = createAction('PERMISSION_DELETE_MODAL_OPEN');
export const closePermissionDeleteModal = createAction('PERMISSION_DELETE_MODAL_CLOSE');
const initPermissionDelete = createAction('PERMISSION_DELETE_INIT');
const resolvePermissionDelete = createAction('PERMISSION_DELETE_RESOLVE');
const rejectPermissionDelete = createAction('PERMISSION_DELETE_REJECT', (err) => {
  return { err };
});

export const deletePermission = (props) => (dispatch) => {
  dispatch(initPermissionDelete());
  return yeepClient
    .api()
    .then((api) =>
      api.permission.delete({
        ...props,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(deletePermission),
      })
    )
    .then((data) => {
      dispatch(resolvePermissionDelete(data));
      return true;
    })
    .catch((err) => {
      dispatch(rejectPermissionDelete(err));
      return false;
    });
};

// reducer
export const reducer = handleActions(
  {
    // Create Permission
    [openPermissionCreateModal]: (state, action) => {
      callbacks.onPermissionCreateCancel = action.payload.onCancel;
      callbacks.onPermissionCreateSubmit = action.payload.onSubmit;
      return {
        ...state,
        displayedModal: 'PERMISSION_CREATE'
      };
    },
    [closePermissionCreateModal]: (state) => {
      callbacks.onPermissionCreateCancel = noop;
      callbacks.onPermissionCreateSubmit = noop;
      return {
        ...state,
        displayedModal: '',
        permission: {},
        permissionCreateError: '',
        isPermissionCreatePending: false,
      };
    },
    [initPermissionCreate]: (state) => {
      return {
        ...state,
        permissionCreateError: '',
        isPermissionCreatePending: true,
      };
    },
    [resolvePermissionCreate]: (state) => {
      return {
        ...state,
        isPermissionCreatePending: false,
      };
    },
    [rejectPermissionCreate]: (state, action) => {
      return {
        ...state,
        permissionCreateError: action.payload.err,
        isPermissionCreatePending: false,
      };
    },
    // Edit Permission
    [openPermissionEditModal]: (state, action) => {
      callbacks.onPermissionEditCancel = action.payload.onCancel;
      callbacks.onPermissionEditSubmit = action.payload.onSubmit;
      return {
        ...state,
        displayedModal: 'PERMISSION_EDIT',
        permission: action.payload.permission,
      };
    },
    [closePermissionEditModal]: (state) => {
      callbacks.onPermissionEditCancel = noop;
      callbacks.onPermissionEditSubmit = noop;
      return {
        ...state,
        displayedModal: '',
        permission: {},
        permissionEditError: '',
        isPermissionEditPending: false,
      };
    },
    [initPermissionEdit]: (state) => {
      return {
        ...state,
        permissionEditError: '',
        isPermissionEditPending: true,
      };
    },
    [resolvePermissionEdit]: (state) => {
      return {
        ...state,
        isPermissionEditPending: false,
      };
    },
    [rejectPermissionEdit]: (state, action) => {
      return {
        ...state,
        permissionEditError: action.payload.err,
        isPermissionEditPending: false,
      };
    },
    // Delete Permission
    [openPermissionDeleteModal]: (state, action) => {
      return {
        ...state,
        displayedModal: 'PERMISSION_DELETE',
        permission: action.payload.permission,
      };
    },
    [closePermissionDeleteModal]: (state) => {
      callbacks.onPermissionDeleteCancel = noop;
      callbacks.onPermissionDeleteSubmit = noop;
      return {
        ...state,
        displayedModal: '',
        permission: {},
        permissionDeleteError: '',
        isPermissionDeletePending: false,
      };
    },
    [initPermissionDelete]: (state) => {
      return {
        ...state,
        permissionDeleteError: '',
        isPermissionDeletePending: true,
      };
    },
    [resolvePermissionDelete]: (state) => {
      return {
        ...state,
        isPermissionDeletePending: false,
      };
    },
    [rejectPermissionDelete]: (state, action) => {
      return {
        ...state,
        permissionDeleteError: action.payload.err,
        isPermissionDeletePending: false,
      };
    },
  },
  initialState
);
