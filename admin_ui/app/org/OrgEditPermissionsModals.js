import React from 'react';
import { useSelector } from 'react-redux';
import PermissionCreate from './modals/PermissionCreate';
import PermissionEdit from './modals/PermissionEdit';
import PermissionDelete from './modals/PermissionDelete';
import * as modalTypes from '../constants/modalTypes';

// The CREATE, EDIT or DELETE modals for the OrgEditPermissions page
const OrgEditPermissionsModals = () => {
  const displayedModal = useSelector((state) => state.org.displayedModal);

  switch (displayedModal) {
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
