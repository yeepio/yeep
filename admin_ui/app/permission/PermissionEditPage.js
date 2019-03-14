import React from 'react';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';

const PermissionEditPage = ({ permissionId }) => {
  useDocumentTitle(`Edit permission #${permissionId}`);
  return (
    <React.Fragment>
      <h3>Permission #{permissionId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

PermissionEditPage.propTypes = {
  permissionId: PropTypes.string,
};

export default PermissionEditPage;
