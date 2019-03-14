import React from 'react';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';

const OrgEditPage = ({ orgId }) => {
  useDocumentTitle(`Edit org #${orgId}`);
  return (
    <React.Fragment>
      <h3>Organization #{orgId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
