import React from 'react';
import { Link } from '@reach/router';
import IconHome from '../icons/IconHome';
import IconOrganisation from '../icons/IconOrganisation';
import IconUser from '../icons/IconUser';
import IconRole from '../icons/IconRole';
import IconPermission from '../icons/IconPermission';
// import IconSession from '../icons/IconSession';
import classNames from 'classnames';

/**
 * LHS navigation.
 */
const AsideNav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink hidden lg:block">
      <ul className="list-reset">
        <li>
          <Link to="/" className={menuStylesNormal}>
            <IconHome className="nav-icon" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/organizations" className={menuStylesNormal}>
            <IconOrganisation className="nav-icon" />
            Organizations
          </Link>
        </li>
        <li>
          <Link to="/users" className={menuStylesNormal}>
            <IconUser height={20} className="nav-icon" />
            Users
          </Link>
        </li>
        <li>
          <Link to="/roles" className={menuStylesNormal}>
            <IconRole className="nav-icon" />
            Roles
          </Link>
        </li>
        <li>
          <Link to="/permissions" className={menuStylesNormal}>
            <IconPermission height={20} className="nav-icon" />
            Permissions
          </Link>
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

// Common menu item styles
const menuStyles = classNames(
  'leading-normal',
  'block',
  'no-underline',
  'border-b',
  'border-white',
  'py-2',
  'pl-16',
  'pr-8',
  'hover:bg-white',
  'relative'
);

// Menu item styles for the default / normal state
const menuStylesNormal = classNames(menuStyles, 'text-black');
// Menu item styles for the selected state
// const menuStylesSelected = classNames(menuStyles, 'text-blue', 'bg-white');

export default AsideNav;
