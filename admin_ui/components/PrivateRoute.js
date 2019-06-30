import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from '@reach/router';
import { useSelector } from 'react-redux';
import qs from 'query-string';
import has from 'lodash/has';

function getRedirectTo() {
  return [
    '/login',
    qs.stringify(
      {
        r: location.pathname + location.search,
      },
      { encode: true }
    ),
  ]
    .filter(Boolean)
    .join('?');
}

const PrivateRoute = ({ as: Component, ...props }) => {
  const user = useSelector((state) => state.session.user);
  return has(user, 'id') ? <Component {...props} /> : <Redirect to={getRedirectTo()} />;
};

PrivateRoute.propTypes = {
  as: PropTypes.func.isRequired,
};

export default PrivateRoute;
