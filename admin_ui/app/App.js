import React from 'react';
import './main.css';
import Header from '../components/Header';
import Nav from '../components/Nav';
import PageWrapper from '../components/PageWrapper';

/**
 * The top level component / wrapper
 * encompassing the Header, Nav and PageWrapper
 */
const App = () => {
  return (
    <React.Fragment>
      <Header />
      <div className="container mx-auto flex">
        <Nav />
        <PageWrapper />
      </div>
    </React.Fragment>
  );
};

export default App;
