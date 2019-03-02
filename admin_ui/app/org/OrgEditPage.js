import React from 'react';
import PropTypes from 'prop-types';
import Head from '../../components/Head';

const OrgEditPage = ({ orgId }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{`Edit org #${orgId}`}</title>
      </Head>
      <h3>Organization #{orgId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
