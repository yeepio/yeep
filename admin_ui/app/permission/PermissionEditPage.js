import React from 'react';
import PropTypes from 'prop-types';
import Head from '../../components/Head';

const PermissionEditPage = ({ permissionId }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{`Edit permission #${permissionId}`}</title>
      </Head>
      <h3>Permission #{permissionId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

PermissionEditPage.propTypes = {
  permissionId: PropTypes.string,
};

export default PermissionEditPage;
