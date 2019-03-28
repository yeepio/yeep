import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import classNames from 'classnames';

const TabLinks = ({ links, className }) => {
  // Iterate through the props.links array and for each element
  // create a <Link /> component and style as a tab
  return (
    <ul className={classNames('list-reset', 'flex', 'border-grey', 'border-b', className)}>
      {links.map((link) => (
        <li key={`tab_{link.label}`} className="mr-1">
          <Link to={link.to} getProps={getTabStyle}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

// Common tab styles
const tabStyles = [
  'inline-block',
  'bg-white',
  'py-2',
  'px-4',
  'no-underline',
  'text-black'
];

/**
 * Style the <a> tab elements as normal or active
 * @param isCurrent - true of the location.pathname is exactly the same as the anchor's href
 * @returns {string} - List of classes to use
 */
const getTabStyle = ({ isCurrent }) => {
  return {
    className: isCurrent
      ? classNames(tabStyles, 'font-semibold -mb-px border-l border-t border-r border-grey')
      : classNames(tabStyles),
  };
};

TabLinks.propTypes = {
  // The "links" prop needs to be an array of strings
  // Each will be passed as the "to" prop of a router <Link/> component
  links: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default TabLinks;
