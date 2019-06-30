import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';

const Button = ({ children, secondary, danger, className, onClick }) => {
  // Common classes for all buttons
  let styles = classNames('border', 'leading-tight', 'font-bold', 'py-2', 'px-4', 'rounded');
  if (secondary) {
    // "Secondary priority" buttons
    styles = classNames(
      styles,
      'border-blue',
      'bg-white',
      'text-blue',
      'hover:bg-grey-light',
      'active:bg-grey'
    );
  } else if (danger) {
    // Red "Danger" buttons
    styles = classNames(
      styles,
      'bg-red',
      'text-white',
      'border-red',
      'hover:bg-red-dark',
      'hover:border-red-dark',
      'active:bg-red-darker',
      'active:border-red-darker'
    );
  } else {
    // Normal buttons
    styles = classNames(
      styles,
      'border-blue',
      'bg-blue',
      'text-white',
      'hover:bg-blue-dark',
      'hover:text-white',
      'hover:border-blue-dark',
      'active:bg-blue-darker',
      'active:border-blue-darker'
    );
  }
  // Add any custom classes that come from the props
  styles = classNames(className, styles);
  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
};

Button.propTypes = {
  // Most frequenly just a string (which will be the button label)
  children: PropTypes.node.isRequired,
  // If set to true we'll show a secondary / lower priority button
  secondary: PropTypes.bool,
  // If set to true we'll show a red "Danger" button
  danger: PropTypes.bool,
  // Click handler
  onClick: PropTypes.func,
  // A custom className
  className: PropTypes.string,
};

Button.defaultProps = {
  children: 'Submit',
  secondary: false,
  danger: false,
  onClick: noop,
};

export default Button;
