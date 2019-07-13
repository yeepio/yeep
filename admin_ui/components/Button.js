import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';

const Button = ({ children, secondary, danger, inProgress, className, ...props }) => {
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
    if (inProgress) {
      styles = classNames(
        styles,
        'border-blue-dark',
        'bg-blue-dark',
        'text-white',
        'italic'
      );
    } else {
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
  }
  // Add any custom classes that come from the props
  styles = classNames(className, styles);
  return (
    <button {...props} className={styles} disabled={inProgress}>
      {inProgress && (
        <img
          src="/spinner.svg"
          alt="*"
          width={20}
          height={20}
          className="inline-block mr-3 align-middle"
        />
      )}
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
  // If set to true we'll disable the button and show an animated preloader
  // next to it's label (which will be italicised as well)
  inProgress: PropTypes.bool,
  // A custom className
  className: PropTypes.string,
};

Button.defaultProps = {
  type: 'button',
  children: 'Submit',
  secondary: false,
  danger: false,
  inProgress: false,
  onClick: noop,
};

export default Button;
