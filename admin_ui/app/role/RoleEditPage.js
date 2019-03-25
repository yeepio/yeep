import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const RoleEditPage = ({ roleId }) => {
  useDocumentTitle(`Edit role#${roleId}`);
  return (
    <React.Fragment>
      <h3>Edit role #{roleId}</h3>
      <p><Link to="/roles">Return to the list of roles</Link></p>
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
