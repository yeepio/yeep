import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ label, isSecondary, className }) => {
  return <button className={chooseLookAndFeel(isSecondary, className)}>{label}</button>;
};

/**
 * UI helper method. Returns a list of Tailwind CSS classes
 * (optionally appended by a custom className if specified)
 * depending on whether we're showing the default
 * or a "secondary priority" button
 * @param {boolean }isSecondary - A flag to indicate if we're showing a secondary priority button
 * @param {string} (className) - If specified it will be appended to the returned value
 * @returns {string} - A space-separated list of CSS classes
 */
const chooseLookAndFeel = (isSecondary, className = '') => {
  // Default styles shared between all buttons
  let buttonStyles = ['border', 'border-blue', 'font-bold', 'py-2', 'px-4', 'rounded'];
  if (isSecondary) {
    // We need to show a lower / "secondary" priority  buttton
    buttonStyles = [...buttonStyles, 'bg-white', 'border-blue', 'text-blue', 'hover:bg-grey-light'];
  } else {
    // We're showing the default blue button
    buttonStyles = [
      ...buttonStyles,
      'bg-blue',
      'text-white',
      'hover:bg-blue-dark',
      'hover:text-white',
    ];
  }
  // Have we specified any custom className for this component instance?
  // If so add it to the array of CSS classes
  className && buttonStyles.push(className);
  // Return the space-separated list of CSS classes
  return buttonStyles.join(' ');
};

Button.propTypes = {
  // The string label of the button
  label: PropTypes.string.isRequired,
  // If set to true we'll show a secondary / lower priority button
  isSecondary: PropTypes.bool,
  // A custom className
  className: PropTypes.string,
};

Button.defaultProps = {
  label: 'Submit',
  isSecondary: false,
};

export default Button;
