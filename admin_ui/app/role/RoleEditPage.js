import React from 'react';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';

const RoleEditPage = ({ roleId }) => {
  useDocumentTitle(`Edit role#${roleId}`);
  return (
    <React.Fragment>
      <h3>Role #{roleId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
