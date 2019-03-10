import React from 'react';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';

const UserEditPage = ({ userId }) => {
  useDocumentTitle(`Edit user#${userId}`);
  return (
    <React.Fragment>
      <h3>User #{userId} Edit (WIP)</h3>
    </React.Fragment>
  );
};

UserEditPage.propTypes = {
  userId: PropTypes.string,
};

export default UserEditPage;
