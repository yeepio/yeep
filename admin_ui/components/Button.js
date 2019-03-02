import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Button = ({ children, isSecondary, className }) => {
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
          'bg-white': isSecondary,
          'text-blue': isSecondary,
          'hover:bg-grey-light': isSecondary,
        },
        {
          'bg-blue': !isSecondary,
          'text-white': !isSecondary,
          'hover:bg-blue-dark': !isSecondary,
          'hover:text-white': !isSecondary,
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
  isSecondary: PropTypes.bool,
  // A custom className
  className: PropTypes.string,
};

Button.defaultProps = {
  children: 'Submit',
  isSecondary: false,
};

export default Button;
