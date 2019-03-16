import React from 'react';
import useDocumentTitle from '@rehooks/document-title';

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  return (
    <React.Fragment>
      <h1>Dashboard</h1>
    </React.Fragment>
  );
};

export default DashboardPage;
