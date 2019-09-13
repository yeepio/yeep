import React from 'react';
import { Router } from '@reach/router';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import { getOrgInfo, setOrgFormValues, resetOrgFormValues } from './orgStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';
import TabLinks from '../../components/TabLinks';
import OrgEditProfileTab from './OrgEditProfileTab';
import OrgEditPermissionsTab from './OrgEditPermissionsTab';

const OrgEditPage = ({ orgId }) => {
  const records = useSelector((state) => state.org.list.records);
  const isLoading = useSelector((state) => state.org.form.isLoading);
  const values = useSelector((state) => state.org.form.values);
  const dispatch = useDispatch();

  React.useEffect(() => {
    // check if org info already exists in store
    const org = find(records, (e) => e.id === orgId);

    if (org) {
      dispatch(setOrgFormValues(org));
    } else {
      // org does not exist in store - retrieve from API
      dispatch(getOrgInfo({ id: orgId }));
    }

    return () => {
      yeepClient.redeemCancelToken(getOrgInfo);
      dispatch(resetOrgFormValues());
    };
  }, [orgId, records, dispatch]);

  useDocumentTitle(`Edit organization ${orgId}`);

  if (values.id == null || isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Edit organization {values.name}</h1>
      <TabLinks
        className="mb-6"
        links={[
          {
            label: 'Org details',
            to: `/organizations/${orgId}/edit`,
          },
          {
            label: 'Permissions',
            to: `/organizations/${orgId}/edit/permissions`,
          },
          {
            label: 'Roles',
            to: `/organizations/${orgId}/edit/roles`,
          },
          {
            label: 'Users',
            to: `/organizations/${orgId}/edit/users`,
          },
        ]}
      />
      <Router>
        <OrgEditProfileTab path="/" />
        <OrgEditPermissionsTab path="/permissions" />
      </Router>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
