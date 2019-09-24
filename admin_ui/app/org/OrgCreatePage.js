import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import OrgForm from './OrgForm';
import { createOrg } from './orgStore';
import { gotoOrgListPage } from './orgURL';

const OrgCreatePage = () => {
  const errors = useSelector((state) => state.org.create.errors);
  const isSavePending = useSelector((state) => state.org.create.isSavePending);

  const dispatch = useDispatch();

  const onSubmit = React.useCallback(
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
      <OrgForm
        errors={errors}
        isSavePending={isSavePending}
        onCancel={gotoOrgListPage}
        onSubmit={onSubmit}
      />
    </React.Fragment>
  );
};

export default OrgCreatePage;
