import React from 'react';
import { Link } from '@reach/router';

const PageNotFound = () => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl text-grey mb-4">Page not found</p>
        <p><Link to="/">return to the dashboard</Link></p>
      </div>
    </div>
  );
};

export default PageNotFound;
