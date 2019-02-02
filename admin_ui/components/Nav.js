import React from 'react';

/**
 * LHS navigation.
 */
const Nav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink">
      <ul className="list-reset">
        <li><a href="/admin">Dashboard</a></li>
        <li><a href="/admin/organisations">Organisations</a></li>
        <li><a href="/admin/users">Users</a></li>
        <li><a href="/admin/roles">Roles</a></li>
        <li><a href="/admin/sessions">Sessions</a></li>
      </ul>
    </nav>
  );
};

export default Nav;
