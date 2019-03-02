import React from 'react';
import PropTypes from 'prop-types';
import Head from '../../components/Head';

const UserEditPage = ({ userId }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{`Edit user#${userId}`}</title>
      </Head>
      <h3>User #{userId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

UserEditPage.propTypes = {
  userId: PropTypes.string,
};

export default UserEditPage;
