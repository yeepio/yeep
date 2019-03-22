import React from 'react';
import useDocumentTitle from '@rehooks/document-title';
import { Link } from '@reach/router';

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  return (
    <div className="leading-normal p-4 sm:p-8 max-w-2xl">
      <h1 className="mb-4">Dashboard</h1>
      <p className="mb-4">
        Welcome <strong>USERNAME</strong>, below are a few links to get you started:
      </p>
      <ol>
        <li>
          <Link to="/organizations" className="font-bold">
            Create an organisation
          </Link>
          <br />
          We need a single sentence here to describe the concept of an org
        </li>
      </ol>
    </div>
  );
};

export default DashboardPage;
