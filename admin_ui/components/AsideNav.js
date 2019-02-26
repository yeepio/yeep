import React from 'react';
import IconHome from '../icons/IconHome';
import IconOrganisation from '../icons/IconOrganisation';
import IconUser from '../icons/IconUser';
import IconRole from '../icons/IconRole';
import IconPermission from '../icons/IconPermission';
import IconSession from '../icons/IconSession';
import classNames from 'classnames';

/**
 * LHS navigation.
 */
const AsideNav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink hidden lg:block">
      <ul className="list-reset">
        <li>
          <a href="#top" className={menuStylesNormal}>
            <IconHome className="nav-icon" />
            Dashboard
          </a>
        </li>
        <li>
          <a href="#top" className={menuStylesSelected}>
            <IconOrganisation color="#08a2e3" className="nav-icon" />
            Organisations
          </a>
        </li>
        <li>
          <a href="#top" className={menuStylesNormal}>
            <IconUser height={20} className="nav-icon" />
            Users
          </a>
        </li>
        <li>
          <a href="#top" className={menuStylesNormal}>
            <IconRole className="nav-icon" />
            Roles
          </a>
        </li>
        <li>
          <a href="#top" className={menuStylesNormal}>
            <IconPermission height={20} className="nav-icon" />
            Permissions
          </a>
        </li>
        <li>
          <a href="#top" className={menuStylesNormal}>
            <IconSession className="nav-icon" />
            Sessions
          </a>
        </li>
      </ul>
      <style jsx>{`
        nav {
          /* Min height of the nav is the viewport height minus the 4rem of the header */
          min-height: calc(100vh - 4rem);
        }
        nav a {
          padding-left: calc(1.5rem + 24px);
        }
        :global(.nav-icon) {
          position: absolute;
          left: 1rem;
        }
      `}</style>
    </nav>
  );
};

// Menu item styles
const menuStyles = classNames(
  'leading-normal',
  'block',
  'no-underline',
  'border-b',
  'border-white',
  'py-2',
  'px-8',
  'hover:bg-white',
  'relative'
);

// Menu item styles for "normal" state
const menuStylesNormal = classNames(menuStyles, 'text-black');
// Menu item styles for "selected" state
const menuStylesSelected = classNames(menuStyles, 'text-blue', 'bg-white');

export default AsideNav;
