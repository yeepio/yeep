import React from 'react';
import PropTypes from 'prop-types';

const Textarea = ({ className, ...otherProps }) => {
  return (
    <textarea
      {...otherProps}
      className={`block border border-grey p-2 rounded leading-normal ${className}`}
    />
  );
};

Textarea.propTypes = {
  className: PropTypes.string,
};

export default Textarea;
