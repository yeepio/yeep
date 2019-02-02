import React from 'react';

/**
 * LHS navigation.
 * TODO: use #top for link hrefs here to avoid eslint's "anchor-is-valid" perstering us,
 *  change this when we have proper routes.
 */
const Nav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink">
      <ul className="list-reset">
        <li>
          <a href="#top">Dashboard</a>
        </li>
        <li>
          <a href="#top" className="selected text-blue">
            Organisations
          </a>
        </li>
        <li>
          <a href="#top">Users</a>
        </li>
        <li>
          <a href="#top">Roles</a>
        </li>
        <li>
          <a href="#top">Sessions</a>
        </li>
      </ul>
      {
        <style jsx>{`
          nav {
            /* Min height of the nav is the viewport height minus the 4rem of the header */
            min-height: calc(100vh - 4rem);
          }
          nav a {
            color: #22292f;
            text-decoration: none;
            /*
              0.8rem ~= 12.8 px + 18px line height == 43.6px which brings us close to
              the 44px "thumbprint" height we're after
             */
            padding: 0.8rem 2rem;
            display: block;
            border-bottom: 1px solid white;
          }
          nav a:hover {
              background-color:white;
          }
          nav a.selected {
              background-color:white;
          }
        `}</style>
      }
    </nav>
  );
};

export default Nav;
