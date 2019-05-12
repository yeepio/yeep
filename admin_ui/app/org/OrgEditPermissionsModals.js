import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import PermissionCreate from './modals/PermissionCreate';
import PermissionEdit from './modals/PermissionEdit';
import PermissionDelete from './modals/PermissionDelete';
import * as modalTypes from '../constants/modalTypes';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditPermissionsModals = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const currentModal = useObservable(
    () => store.org.displayedModal$,
    store.org.displayedModal$.getValue()
  );

  switch (currentModal) {
    case modalTypes.PERMISSION_CREATE:
      return <PermissionCreate />;
    case modalTypes.PERMISSION_EDIT:
      return <PermissionEdit />;
    case modalTypes.PERMISSION_DELETE:
      return <PermissionDelete />;
  }
  return null;

};

export default OrgEditPermissionsModals;
