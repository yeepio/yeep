import React, { useCallback } from 'react';
import { Link, navigate } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import OrgDeleteModal from './OrgDeleteModal';
import OrgForm from '../../components/OrgForm';
import { updateOrg, openOrgDeleteModal } from './orgStore';

function gotoOrgListPage() {
  navigate('/organizations');
}

const OrgEditProfileTab = () => {
  const values = useSelector((state) => state.org.form.values);
  const errors = useSelector((state) => state.org.form.errors);
  const isSavePending = useSelector((state) => state.org.form.isSavePending);
  const dispatch = useDispatch();

  const onOrgDelete = useCallback(
    (values) => {
      dispatch(openOrgDeleteModal({ org: values }));
    },
    [dispatch]
  );

  const submitForm = useCallback(
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
        defaultValues={values}
        isSavePending={isSavePending}
        errors={errors}
        onCancel={gotoOrgListPage}
        onSubmit={submitForm}
        onDelete={onOrgDelete}
      />
      <p className="flex">
        <Link to="/organizations">Return to the list of organizations</Link>
        <Link to={`/organizations/${values.id}/edit/permissions`} className="ml-auto">
          Permissions &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

export default OrgEditProfileTab;
