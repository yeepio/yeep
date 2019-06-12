import React from 'react';

// WIP
const GridPager = () => {
  return (
    <React.Fragment>
      <ul className="ml-auto whitespace-no-wrap">
        <li className="px-2 inline-block">
          <a href="/">&laquo; Previous</a>
        </li>
{/*        <li className="px-2 inline-block">
          <a href="/">1</a>
        </li>
        <li className="px-2 inline-block">
          <strong>2</strong>
        </li>
        <li className="px-2 inline-block">...</li>
        <li className="px-2 inline-block">
          <a href="/">7</a>
        </li>*/}
        <li className="px-2 inline-block">
          <a href="/">Next &raquo;</a>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default GridPager;
