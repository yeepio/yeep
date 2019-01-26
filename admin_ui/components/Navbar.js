import React from 'react';
import PropTypes from 'prop-types';

const Navbar = ({ elevated }) => {
  return (
    <React.Fragment>
      <style jsx>{`
        nav {
          box-shadow: ${elevated ? '0 5px 5px red' : 'none'};
        }
      `}</style>
      <nav className="bg-grey-dark">This is a navbar!</nav>
    </React.Fragment>
  );
};

Navbar.propTypes = {
  elevated: PropTypes.bool,
};

Navbar.defaultProps = {
  elevated: false,
};

export default Navbar;
