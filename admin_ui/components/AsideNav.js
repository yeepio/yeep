import React from 'react';

/**
 * LHS navigation.
 */
const AsideNav = () => {
  return (
    <nav className="bg-grey-light w-64 flex-no-shrink hidden lg:block">
      <ul className="list-reset">
        {['Dashboard', 'Organisations', 'Users', 'Roles', 'Sessions'].map((menuItem, index) => (
          <li key={menuItem}>
            <a href="#top" className={index === 1 ? getMenuStyle('selected') : getMenuStyle()}>
              {menuItem}
            </a>
          </li>
        ))}
      </ul>
      <style jsx>{`
        nav {
          /* Min height of the nav is the viewport height minus the 4rem of the header */
          min-height: calc(100vh - 4rem);
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
    'block',
    'no-underline',
    'border-b',
    'border-white',
    'py-3',
    'px-8',
    'hover:bg-white',
  ];
  if (state === 'normal') {
    styles.push('text-black');
  } else if (state === 'selected') {
    styles = [...styles, 'text-blue', 'bg-white'];
  }
  return styles.join(' ');
};

export default AsideNav;
