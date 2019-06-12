import React from 'react';
import Logo from './Logo.js';
import { Link } from '@reach/router';

/**
 * The header
 */
const TopNav = () => {
  return (
    <header className="bg-grey-dark text-white">
      <div className="mx-auto h-16 flex items-center">
        <Logo/>
        <h2 className="text-xl ml-4 font-light opacity-50 hidden lg:block">headless user management</h2>
        <ul className="ml-auto flex items-center">
          <li className="hidden md:block">
            <Link to="/feedback" className="text-white hover:text-grey ">
              Send feedback
            </Link>
          </li>
          <li className="ml-4 hidden md:block">
            <Link to="/login" className="text-white hover:text-grey ">
              Angelos Chaidas
            </Link>
          </li>
          <li className="ml-4 mr-4">
            <Link to="/login" className="opacity-50">
              <img src="/yeep-user-profile.svg" alt="View your profile"/>
            </Link>
          </li>
          <li className="mr-4 lg:hidden">
            <button className="opacity-50">
              <img src="/yeep-icon-hamburger.svg" alt="Toggle the menu"/>
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default TopNav;
