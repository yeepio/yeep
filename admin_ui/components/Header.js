import React from 'react';

/**
 * The header
 */
const Header = () => {
  return (
    <header className="bg-grey-dark text-white">
      <div className="container mx-auto h-16 flex items-center">
        <h1 className="yeep-logo">CompanyName</h1>
        <h2 className="text-xl ml-4 font-light opacity-50">headless user management</h2>
        <ul className="list-reset ml-auto flex items-center">
          <li>
            <a href="/feedback" className="text-white hover:text-grey">
              Send feedback
            </a>
          </li>
          <li className="ml-4">
            <a href="/profile" className="text-white hover:text-grey">
              Angelos Chaidas
            </a>
          </li>
          <li className="ml-4">
            <a href="/profile" className="opacity-50 hover:opacity-100">
              <img src="/yeep-user-profile.svg" alt="View your profile"/>
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
