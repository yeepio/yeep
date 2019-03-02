import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

const Head = ({ children }) => <Helmet titleTemplate="%s - Yeep">{children}</Helmet>;

Head.propTypes = {
  children: PropTypes.node,
};

export default Head;
