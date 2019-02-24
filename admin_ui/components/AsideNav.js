import React from 'react';
import IconHome from '../icons/IconHome';
import IconOrganisation from '../icons/IconOrganisation';
import IconUser from '../icons/IconUser';
import IconRole from '../icons/IconRole';
import IconPermission from '../icons/IconPermission';
import IconSession from '../icons/IconSession';

/**
 * LHS navigation.
 */
const AsideNav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink hidden lg:block">
      <ul className="list-reset">
        <li>
          <a href="#top" className={getMenuStyle()}>
            <IconHome className="nav-icon"/>
            Dashboard
          </a>
        </li>
        <li>
          <a href="#top" className={getMenuStyle('selected')}>
            <IconOrganisation color="#08a2e3" className="nav-icon" />
            Organisations
          </a>
        </li>
        <li>
          <a href="#top" className={getMenuStyle()}>
            <IconUser height={20} className="nav-icon" />
            Users
          </a>
        </li>
        <li>
          <a href="#top" className={getMenuStyle()}>
            <IconRole className="nav-icon" />
            Roles
          </a>
        </li>
        <li>
          <a href="#top" className={getMenuStyle()}>
            <IconPermission height={20} className="nav-icon" />
            Permissions
          </a>
        </li>
        <li>
          <a href="#top" className={getMenuStyle()}>
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
          padding-left:calc(1.5rem + 24px);
        }
        :global(.nav-icon) {
          position:absolute;
          left:1rem;
        }
      `}</style>
    </nav>
  );
};

/**
 * Returns a space-separated list of Tailwind CSS classes
 * to skin the menu items of the <AsideNav/>
 * @param {string} state - Either "normal" (default) or "selected"
 * @returns {string} - A space-separated list of Tailwind CSS classes
 */
const getMenuStyle = (state = 'normal') => {
  // The Tailwind CSS classes for all nav items
  let styles = [
    'leading-normal',
    'block',
    'no-underline',
    'border-b',
    'border-white',
    'py-2',
    'px-8',
    'hover:bg-white',
    'relative'
  ];
  if (state === 'normal') {
    styles.push('text-black');
  } else if (state === 'selected') {
    styles = [...styles, 'text-blue', 'bg-white'];
  }
  return styles.join(' ');
};

export default AsideNav;
