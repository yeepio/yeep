import React from 'react';
import { useSelector } from 'react-redux';
import RoleCreate from './modals/RoleCreate';
import RoleEdit from './modals/RoleEdit';
import RoleDelete from './modals/RoleDelete';
import * as modalTypes from '../constants/modalTypes';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditRolesModals = () => {
  const displayedModal = useSelector((state) => state.org.displayedModal);

  switch (displayedModal) {
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
