import React from 'react';
import useDocumentTitle from '@rehooks/document-title';

const OrgList = () => {
  useDocumentTitle('Organization List');
  return (
    <div className="leading-normal p-4 sm:p-8 max-w-2xl sm:h-full">
      <h1 className="mb-4">Organizations</h1>
    </div>
  );
};

export default OrgList;
