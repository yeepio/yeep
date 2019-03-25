import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const PermissionEditPage = ({ permissionId }) => {
  useDocumentTitle(`Edit permission #${permissionId}`);
  return (
    <React.Fragment>
      <h3>Edit permission #{permissionId}</h3>
      <p><Link to="/permissions">Return to the list of permissions</Link></p>
    </React.Fragment>
  );
};

PermissionEditPage.propTypes = {
  permissionId: PropTypes.string,
};

export default PermissionEditPage;
