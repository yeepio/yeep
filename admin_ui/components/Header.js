import React from 'react';

/**
 * The header
 */
const Header = () => {
  return (
    <header className="bg-grey-dark text-white">
      <div className="max-w-3xl mx-auto h-16 flex items-center">
        <h1 className="yeep-logo ml-4">CompanyName</h1>
        <h2 className="text-xl ml-4 font-light opacity-50 hidden lg:block">headless user management</h2>
        <ul className="list-reset ml-auto flex items-center">
          <li className="hidden md:block">
            <a href="/feedback" className="text-white hover:text-grey">
              Send feedback
            </a>
          </li>
          <li className="ml-4 hidden md:block">
            <a href="#top" className="text-white hover:text-grey">
              Angelos Chaidas
            </a>
          </li>
          <li className="ml-4 mr-4">
            <a href="#to[" className="opacity-50">
              <img src="/yeep-user-profile.svg" alt="View your profile"/>
            </a>
          </li>
          <li className="mr-4 lg:hidden">
            <a href="#top" className="opacity-50">
              <img src="/yeep-icon-hamburger.svg" alt="Toggle the menu"/>
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
