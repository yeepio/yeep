import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Input = ({ className, ...otherProps }) => {
  console.log(otherProps.disabled);
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
        className,
        { 'bg-grey-light' : otherProps.disabled }
      )}
    />
  );
};

Input.propTypes = {
  className: PropTypes.string,
};

export default Input;
