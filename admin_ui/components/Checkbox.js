import React from 'react';
import PropTypes from 'prop-types';

const Checkbox = ({ className, ...otherProps }) => {
  return <input type="checkbox" className={className} {...otherProps} />;
};

Checkbox.propTypes = {
  className: PropTypes.string,
};

export default Checkbox;
