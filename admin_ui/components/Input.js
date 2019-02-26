import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Input = ({ className, ...otherProps }) => {
  return (
    <input
      {...otherProps}
      className={classNames(
        'block',
        'border',
        'border-grey',
        'p-2',
        'rounded',
        'leading-normal',
        className
      )}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;
