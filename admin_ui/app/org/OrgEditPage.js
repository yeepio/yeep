import React from 'react';
import { Router } from '@reach/router';
import PropTypes from 'prop-types';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import { setOrgUpdateRecord, clearOrgUpdateForm } from './orgStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';
import TabLinks from '../../components/TabLinks';
import OrgEditProfileTab from './OrgEditProfileTab';
import OrgEditPermissionsTab from './OrgEditPermissionsTab';
import OrgEditRolesTab from './OrgEditRolesTab';

function getOrgInfo({ id }) {
  return yeepClient
    .api()
    .then((api) =>
      api.org.info({
        id,
        cancelToken: yeepClient.issueCancelTokenAndRedeemPrevious(getOrgInfo),
      })
    )
    .then((data) => data.org);
}

const OrgEditPage = ({ orgId }) => {
  const records = useSelector((state) => state.org.list.records);
  const record = useSelector((state) => state.org.update.record);

  const dispatch = useDispatch();

  React.useEffect(() => {
    // check if org info already exists in store
    const org = find(records, (e) => e.id === orgId);

    if (org) {
      dispatch(setOrgUpdateRecord(org));
    } else {
      // org does not exist in memory - retrieve from API
      getOrgInfo({ id: orgId })
        .then((org) => {
          dispatch(setOrgUpdateRecord(org));
        })
        .catch((err) => {
          console.error(err);
        });
    }

    return () => {
      yeepClient.redeemCancelToken(getOrgInfo);
      dispatch(clearOrgUpdateForm());
    };
  }, [orgId, records, dispatch]);

  useDocumentTitle(`Edit organization ${orgId}`);

  if (record.id == null) {
    return <LoadingIndicator />;
  }

  return (
    <React.Fragment>
      <h1 className="font-semibold text-3xl mb-6">Edit organization {record.name}</h1>
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
        <OrgEditRolesTab path="/roles" />
      </Router>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
