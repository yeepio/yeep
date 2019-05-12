import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import RoleCreate from './modals/RoleCreate';
import RoleEdit from './modals/RoleEdit';
import RoleDelete from './modals/RoleDelete';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditRolesModals = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const currentModal = useObservable(
    () => store.org.currentRolesModal$,
    store.org.currentRolesModal$.getValue()
  );

  switch (currentModal) {
    case 'CREATE':
      return <RoleCreate />;
    case 'EDIT':
      return <RoleEdit />;
    case 'DELETE':
      return <RoleDelete />;
  }
  return null;
};

export default OrgEditRolesModals;
