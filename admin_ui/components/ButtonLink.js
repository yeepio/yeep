import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import classNames from 'classnames';

const ButtonLink = ({ to, children, secondary, className }) => {
  return (
    <Link to={to}
      className={classNames(
        'inline-block',
        'no-underline',
        'leading-tight',
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
          'active:bg-grey': secondary
        },
        {
          'bg-blue': !secondary,
          'text-white': !secondary,
          'hover:bg-blue-dark': !secondary,
          'hover:text-white': !secondary,
          'hover:border-blue-dark': !secondary,
          'active:bg-blue-darker': !secondary,
          'active:border-blue-darker': !secondary,
        },
        className
      )}
    >
      {children}
    </Link>
  );
};

ButtonLink.propTypes = {
  // The string URI to pass on to @reach/router's <Link/>
  to: PropTypes.string.isRequired,
  // Most frequenly just a string (which will be the button label)
  children: PropTypes.node.isRequired,
  // If set to true we'll show a secondary / lower priority button
  secondary: PropTypes.bool,
  // A custom className
  className: PropTypes.string,
};

ButtonLink.defaultProps = {
  to: '#',
  children: 'Submit',
  secondary: false,
};

export default ButtonLink;
