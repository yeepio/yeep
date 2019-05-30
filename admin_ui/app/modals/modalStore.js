import { createAction, handleActions } from 'redux-actions';
import noop from 'lodash/noop';

// initial state
export const initialState = {
  permission: {},
  permissionDeleteError: '',
  isPermissionDeletePending: false,
};

export const callbacks = {
  onPermissionDeleteSubmit: noop,
  onPermissionDeleteCancel: noop,
};

// actions
export const openPermissionDeleteModal = createAction(
  'PERMISSION_DELETE_MODAL_OPEN',
  (permission, onSubmit = noop, onCancel = noop) => {
    return {
      permission,
      onSubmit,
      onCancel,
    };
  }
);
export const closePermissionDeleteModal = createAction('PERMISSION_DELETE_MODAL_CLOSE');
const initPermissionDelete = createAction('PERMISSION_DELETE_INIT');
const resolvePermissionDelete = createAction('PERMISSION_DELETE_RESOLVE');
const rejectPermissionDelete = createAction('PERMISSION_DELETE_REJECT', (err) => {
  return { err };
});
const mockPermissionDeleteApiRequest = (id) => {
  return new Promise((resolve) => {
    // Fake async
    setTimeout(() => {
      console.log(`Deleted permission ${id}`);
      resolve();
    }, 2000);
  });
};
export const deletePermission = (permission) => (dispatch) => {
  dispatch(initPermissionDelete());
  mockPermissionDeleteApiRequest(permission.id)
    .then(() => dispatch(resolvePermissionDelete()))
    .catch((err) => dispatch(rejectPermissionDelete(err)));
};

// reducer
export const reducer = handleActions(
  {
    [openPermissionDeleteModal]: (state, action) => {
      callbacks.onPermissionDeleteCancel = action.payload.onCancel;
      callbacks.onPermissionDeleteSubmit = action.payload.onSubmit;
      return {
        ...state,
        permission: action.payload.permission,
      };
    },
    [closePermissionDeleteModal]: (state) => {
      callbacks.onPermissionDeleteCancel = noop;
      callbacks.onPermissionDeleteSubmit = noop;
      return {
        ...state,
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
