import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { navigate } from '@reach/router';
import Logo from './Logo';
import Avatar from './Avatar';
import { logout } from '../app/session/sessionStore';

const TopNavUser = () => {
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  const onLogoutButtonClick = useCallback(() => {
    dispatch(logout()).then(() => navigate('/login'));
  }, [dispatch]);

  const onClickOutside = useCallback((event) => {
    if (!wrapperRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('click', onClickOutside);
    };
  }, [onClickOutside]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button className="flex items-center" onClick={() => setMenuOpen(!isMenuOpen)}>
        <div className="text-white mr-2">{user.fullName}</div>
        <Avatar src={user.picture} width={40} height={40} />
      </button>
      {isMenuOpen && (
        <ul className="absolute right-0 z-40 shadow bg-white mt-2 border border-grey rounded-sm list-none text-sm text-black">
          <li>
            <button className="py-2 px-4 hover:bg-grey-lighter" onClick={onLogoutButtonClick}>
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

const TopNav = () => {
  return (
    <header className="bg-grey-dark text-white">
      <div className="mx-auto h-16 flex items-center">
        <Logo />
        <h2 className="text-xl ml-4 font-light opacity-50 hidden lg:block">
          headless user management
        </h2>
        <ul className="ml-auto flex items-center">
          {/* <li className="hidden md:block">
            <Link to="/feedback" className="text-white hover:text-grey ">
              Send feedback
            </Link>
          </li>
          <li className="ml-4 hidden md:block">
            <Link to="/login" className="text-white hover:text-grey " />
          </li> */}
          <li className="ml-4 mr-4">
            <TopNavUser />
          </li>
          <li className="mr-4 lg:hidden">
            <button className="opacity-50">
              <img src="/yeep-icon-hamburger.svg" alt="Toggle the menu" />
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default TopNav;
