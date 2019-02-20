import React from 'react';
import './main.css';
import TopNav from '../components/TopNav';
import AsideNav from '../components/AsideNav';
import PageWrapper from '../components/PageWrapper';

/**
 * The top level component / wrapper
 * encompassing the Header, Nav and PageWrapper
 */
const App = () => {
  return (
    <React.Fragment>
      <TopNav />
      <div className="mx-auto flex">
        <AsideNav />
        <PageWrapper />
      </div>
    </React.Fragment>
  );
};

export default App;
