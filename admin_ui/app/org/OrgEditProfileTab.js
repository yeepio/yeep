import React from 'react';
import { Link, navigate } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import OrgDeleteModal from './OrgDeleteModal';
import OrgForm from './OrgForm';
import { updateOrg, setOrgDeleteRecord, showOrgDeleteForm } from './orgStore';

function gotoOrgListPage() {
  navigate('/organizations');
}

const OrgEditProfileTab = () => {
  const record = useSelector((state) => state.org.update.record);
  const errors = useSelector((state) => state.org.update.errors);
  const isSavePending = useSelector((state) => state.org.update.isSavePending);

  const dispatch = useDispatch();

  const onOrgDelete = React.useCallback(
    (org) => {
      dispatch(setOrgDeleteRecord(org));
      dispatch(showOrgDeleteForm());
    },
    [dispatch]
  );

  const submitForm = React.useCallback(
    (nextValues) => {
      dispatch(
        updateOrg({
          id: nextValues.id,
          name: nextValues.name,
          slug: nextValues.slug,
        })
      ).then((isOrgUpdated) => {
        if (isOrgUpdated) {
          gotoOrgListPage();
        }
      });
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <OrgDeleteModal onSuccess={gotoOrgListPage} onError={(err) => console.error(err)} />
      <OrgForm
        defaultValues={record}
        isSavePending={isSavePending}
        errors={errors}
        onCancel={gotoOrgListPage}
        onSubmit={submitForm}
        onDelete={onOrgDelete}
      />
      <p className="flex">
        <Link to="/organizations">Return to the list of organizations</Link>
        <Link to={`/organizations/${record.id}/edit/permissions`} className="ml-auto">
          Permissions &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

export default OrgEditProfileTab;
