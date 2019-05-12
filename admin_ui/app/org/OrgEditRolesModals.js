import React, { useContext } from 'react';
import { useObservable } from 'rxjs-hooks';
import Store from '../Store';
import RoleCreate from './modals/RoleCreate';
import RoleEdit from './modals/RoleEdit';
import RoleDelete from './modals/RoleDelete';
import * as modalTypes from '../constants/modalTypes';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditRolesModals = () => {
  // Load the store
  const store = useContext(Store);

  // Establish the value of the currentModal$ observable
  const currentModal = useObservable(
    () => store.org.displayedModal$,
    store.org.displayedModal$.getValue()
  );

  switch (currentModal) {
    case modalTypes.ROLE_CREATE:
      return <RoleCreate />;
    case modalTypes.ROLE_EDIT:
      return <RoleEdit />;
    case modalTypes.ROLE_DELETE:
      return <RoleDelete />;
  }
  return null;
};

export default OrgEditRolesModals;
