import React from 'react';

/**
 * White Yeep logo and company name
 */
const Logo = () => {
  return (
    <React.Fragment>
      <h1 className="font-bold ml-4 text-lg sm:text-2xl">CompanyName</h1>
      <style jsx>{`
        h1 {
          padding-left: 38px;
          min-height: 40px;
          line-height: 40px;
          display: block;
          background: url('/yeep-logo-white.svg') no-repeat left center;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Logo;
