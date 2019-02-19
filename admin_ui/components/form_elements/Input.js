import React from 'react';
import PropTypes from 'prop-types';

const Input = ({ className, ...otherProps }) => {
  return (
    <input
      {...otherProps}
      className={`block border border-grey p-2 rounded leading-normal ${className}`}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;
