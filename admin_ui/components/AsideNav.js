import React from 'react';
import PropTypes from 'prop-types';
import IconHome from '../icons/IconHome';
import IconOrganisation from '../icons/IconOrganisation';
import IconUser from '../icons/IconUser';
import IconRole from '../icons/IconRole';
import IconPermission from '../icons/IconPermission';
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

/**
 * LHS navigation.
 */
const AsideNav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-shrink-0 hidden lg:block">
      <ul>
        <li>
          <NavLink to="/">
            <IconHome className="nav-icon" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/organizations">
            <IconOrganisation className="nav-icon" />
            Organizations
          </NavLink>
        </li>
        <li>
          <NavLink to="/users">
            <IconUser height={20} className="nav-icon" />
            Users
          </NavLink>
        </li>
        <li>
          <NavLink to="/roles">
            <IconRole className="nav-icon" />
            Roles
          </NavLink>
        </li>
        <li>
          <NavLink to="/permissions">
            <IconPermission height={20} className="nav-icon" />
            Permissions
          </NavLink>
        </li>
        <li>
          {/*<Link to="/sessions" className={menuStylesNormal}>
            <IconSession className="nav-icon" />
            Sessions
          </Link>*/}
        </li>
      </ul>
      <style jsx>{`
        nav {
          /* Min height of the nav is the viewport height minus the 4rem of the header */
          min-height: calc(100vh - 4rem);
        }
        :global(.nav-icon) {
          position: absolute;
          left: 1rem;
        }
      `}</style>
    </nav>
  );
};

export default AsideNav;
