import React from 'react';
import PropTypes from 'prop-types';
import Head from '../../components/Head';

const RoleEditPage = ({ roleId }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{`Edit role#${roleId}`}</title>
      </Head>
      <h3>Role #{roleId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

RoleEditPage.propTypes = {
  roleId: PropTypes.string,
};

export default RoleEditPage;
