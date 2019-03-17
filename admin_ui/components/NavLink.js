import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import classNames from 'classnames';

// Common menu item styles
const menuStyles = [
  'leading-normal',
  'block',
  'no-underline',
  'border-b',
  'border-white',
  'py-2',
  'pl-16',
  'pr-8',
  'hover:bg-white',
  'relative',
];

/**
 * Style the navigation link as normal or active
 * @param isCurrent - true if the location.pathname is exactly the same as the anchor's href
 * @returns {string} - List of classes to use
 */
const getMenuStyle = ({ isCurrent }) => {
  return {
    className: isCurrent
      ? classNames(menuStyles, 'text-blue', 'bg-white')
      : classNames(menuStyles, 'text-black'),
  };
};

const NavLink = (props) => {
  return (
    <Link {...props} getProps={getMenuStyle}>
      {props.children}
    </Link>
  );
};

NavLink.propTypes = {
  children: PropTypes.node,
};

export default NavLink;