import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({ children, secondary, className }) => {
  return (
    <button
      className={classNames(
        'border',
        'border-blue',
        'font-bold',
        'py-2',
        'px-4',
        'rounded',
        {
          'bg-white': secondary,
          'text-blue': secondary,
          'hover:bg-grey-light': secondary,
        },
        {
          'bg-blue': !secondary,
          'text-white': !secondary,
          'hover:bg-blue-dark': !secondary,
          'hover:text-white': !secondary,
        },
        className
      )}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  // Most frequenly just a string (which will be the button label)
  children: PropTypes.node.isRequired,
  // If set to true we'll show a secondary / lower priority button
  secondary: PropTypes.bool,
  // A custom className
  className: PropTypes.string,
};

Button.defaultProps = {
  children: 'Submit',
  secondary: false,
};

export default Button;
