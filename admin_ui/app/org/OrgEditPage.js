import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, navigate } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useDispatch, useSelector } from 'react-redux';
import find from 'lodash/find';
import OrgDeleteModal from './OrgDeleteModal';
import OrgForm from './OrgForm';
import { updateOrg, getOrgInfo, setOrgFormValues, openOrgDeleteModal } from './orgStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import yeepClient from '../yeepClient';
import TabLinks from '../../components/TabLinks';

function gotoOrgListPage() {
  navigate('/organizations');
}

const OrgEditPage = ({ orgId }) => {
  const records = useSelector((state) => state.org.list.records);
  const isLoading = useSelector((state) => state.org.form.isLoading);
  const dispatch = useDispatch();

  useDocumentTitle(`Edit organization ${orgId}`);

  useEffect(() => {
    // check if org info already exists in store
    const org = find(records, (e) => e.id === orgId);

    if (org) {
      dispatch(setOrgFormValues(org));
    } else {
      // org does not exist in memory - retrieve from API
      dispatch(getOrgInfo({ id: orgId }));
    }

    return () => {
      yeepClient.redeemCancelToken(getOrgInfo);
    };
  }, [orgId, records, dispatch]);

  const onOrgDelete = useCallback(
    (values) => {
      dispatch(
        openOrgDeleteModal({
          org: {
            id: orgId,
            ...values,
          },
        })
      );
    },
    [dispatch, orgId]
  );

  const submitForm = useCallback(
    (values) => {
      dispatch(
        updateOrg({
          id: orgId,
          name: values.name,
          slug: values.slug,
        })
      ).then((isOrgUpdated) => {
        if (isOrgUpdated) {
          gotoOrgListPage();
        }
      });
    },
    [dispatch, orgId]
  );

  return (
    <React.Fragment>
      <OrgDeleteModal onSuccess={gotoOrgListPage} onError={(err) => console.error(err)} />
      <h1 className="font-semibold text-3xl mb-6">Edit organization {orgId}</h1>
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
      {isLoading == null ? (
        <LoadingIndicator />
      ) : (
        <OrgForm
          type="update"
          onCancel={gotoOrgListPage}
          onSubmit={submitForm}
          onDelete={onOrgDelete}
        />
      )}
      <p className="flex">
        <Link to="/organizations">Return to the list of organizations</Link>
        <Link to={`/organizations/${orgId}/edit/permissions`} className="ml-auto">
          Permissions &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

OrgEditPage.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPage;
