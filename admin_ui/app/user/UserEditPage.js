import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';

const UserEditPage = ({ userId }) => {
  useDocumentTitle(`Edit user #${userId}`);
  return (
    <React.Fragment>
      <h3>Edit user #{userId}</h3>
      <p><Link to="/users">Return to the list of users</Link></p>
    </React.Fragment>
  );
};

UserEditPage.propTypes = {
  userId: PropTypes.string,
};

export default UserEditPage;
