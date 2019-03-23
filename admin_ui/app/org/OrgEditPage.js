import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const OrgEditPage = ({ orgId }) => {
  useDocumentTitle(`Edit organization #${orgId}`);
  return (
    <React.Fragment>
      <h1>Edit organization #{orgId}</h1>
      <p>Return to the <Link to="/organizations">list of organizations</Link></p>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
