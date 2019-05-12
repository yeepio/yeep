import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import PermissionCreate from './modals/PermissionCreate';
import PermissionEdit from './modals/PermissionEdit';
import PermissionDelete from './modals/PermissionDelete';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditPermissionsModals = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const currentModal = useObservable(
    () => store.org.currentPermissionsModal$,
    store.org.currentPermissionsModal$.getValue()
  );

  switch (currentModal) {
    case 'CREATE':
      return <PermissionCreate />;
    case 'EDIT':
      return <PermissionEdit />;
    case 'DELETE':
      return <PermissionDelete />;
  }
  return null;

};

export default OrgEditPermissionsModals;
