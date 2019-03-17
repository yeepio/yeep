import React from 'react';
import NavLink from './NavLink';
import IconHome from '../icons/IconHome';
import IconOrganisation from '../icons/IconOrganisation';
import IconUser from '../icons/IconUser';
import IconRole from '../icons/IconRole';
import IconPermission from '../icons/IconPermission';
// import IconSession from '../icons/IconSession';

/**
 * LHS navigation.
 */
const AsideNav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink hidden lg:block">
      <ul className="list-reset">
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