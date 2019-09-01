import React, { useEffect, useCallback } from 'react';
import { navigate } from '@reach/router';
import { useDispatch } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import OrgForm from './OrgForm';
import { createOrg, resetOrgFormValues } from './orgStore';

function gotoOrgListPage() {
  navigate('/organizations');
}

const OrgCreatePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // clear existing form values
    dispatch(resetOrgFormValues());
  }, [dispatch]);

  const onSubmit = useCallback(
    (values) => {
      dispatch(
        createOrg({
          name: values.name,
          slug: values.slug,
        })
      ).then((isOrgCreated) => {
        if (isOrgCreated) {
          gotoOrgListPage();
        }
      });
    },
    [dispatch]
  );

  useDocumentTitle('Create organization');

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Create new organization</h1>
      <OrgForm onCancel={gotoOrgListPage} onSubmit={onSubmit} />
    </React.Fragment>
  );
};

export default OrgCreatePage;
