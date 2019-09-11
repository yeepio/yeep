import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import { useDispatch, useSelector } from 'react-redux';
import useDocumentTitle from '@rehooks/document-title';
import TabLinks from '../../components/TabLinks';
import Button from '../../components/Button';
import PermissionCreateModal from '../modals/PermissionCreateModal';
import PermissionEditModal from '../modals/PermissionEditModal';
import PermissionDeleteModal from '../modals/PermissionDeleteModal';
import {
  openPermissionCreateModal,
  openPermissionEditModal,
  openPermissionDeleteModal,
} from '../modals/permissionModalsStore';
import PermissionGrid from '../../components/PermissionGrid';
import {
  listOrgPermissions,
  setOrgPermissionListPage,
  setOrgPermissionListLimit,
} from './orgStore';
import yeepClient from '../yeepClient';

const OrgEditPermissions = ({ orgId }) => {
  const isLoading = useSelector((state) => state.org.permission.list.isLoading);
  const records = useSelector((state) => state.org.permission.list.records);
  const totalCount = useSelector((state) => state.org.permission.list.totalCount);
  const limit = useSelector((state) => state.org.permission.list.limit);
  const page = useSelector((state) => state.org.permission.list.page);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(listOrgPermissions());
    return () => {
      // on unmount cancel any in-flight request
      yeepClient.redeemCancelToken(listOrgPermissions);
    };
  }, [dispatch, limit, page]);

  const reload = React.useCallback(() => {
    dispatch(listOrgPermissions());
  }, [dispatch]);

  const onPermissionDelete = React.useCallback(
    (permission) => {
      // dispatch(openPermissionDeleteModal({ permission }));
    },
    [dispatch]
  );

  const onPageNext = React.useCallback(() => {
    dispatch(setOrgPermissionListPage({ page: page + 1 }));
  }, [dispatch, page]);

  const onPagePrevious = React.useCallback(() => {
    dispatch(setOrgPermissionListPage({ page: page - 1 }));
  }, [dispatch, page]);

  const onLimitChange = React.useCallback(
    (event) => {
      const newLimit = event.value;
      dispatch(setOrgPermissionListLimit({ limit: newLimit }));
    },
    [dispatch]
  );

  useDocumentTitle(`${orgId}: Permissions`);

  return (
    <React.Fragment>
      <PermissionCreateModal />
      <PermissionEditModal />
      <PermissionDeleteModal />
      <h1 className="font-semibold text-3xl mb-6">&quot;Organization name&quot;: Permissions</h1>
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
      <fieldset className="mb-6">
        <legend>New permissions</legend>
        <Button
          onClick={() => {
            dispatch(openPermissionCreateModal());
          }}
        >
          Create new permission
        </Button>
        <p className="mt-4">
          Tip: If you want to create a permission that is <em>not</em> scoped to the
          &quot;ORGNAME&quot; organization, please{' '}
          <Link to="/permissions">visit the permissions page</Link>.
        </p>
      </fieldset>
      <fieldset className="mb-6">
        <legend>Existing permissions</legend>
        <PermissionGrid
          isLoading={isLoading}
          records={records}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onNextClick={onPageNext}
          onPreviousClick={onPagePrevious}
          onLimitChange={onLimitChange}
          getRecordEditLink={(record) => `${record.id}/edit`}
          onRecordDelete={onPermissionDelete}
        />
        {/* <Grid
          headings={permissionHeadings}
          data={permissionData}
          renderer={(permissionData, index) => {
            return (
              <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
                <td className="p-2">{permissionData.name}</td>
                <td className="p-2 text-center">{permissionData.systemPermission ? 'Yes' : '-'}</td>
                <td className="p-2 text-center">{permissionData.roles}</td>
                <td className="p-2 text-right">
                  <button
                    className="pseudolink"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(
                        openPermissionEditModal(
                          permissionData,
                          () => {
                            console.log('Submit from permissionEdit modal!');
                          },
                          () => {
                            console.log('Cancel from permissionEdit modal');
                          }
                        )
                      );
                    }}
                  >
                    Edit
                  </button>{' '}
                  <button
                    className="pseudolink"
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(
                        openPermissionDeleteModal(
                          permissionData,
                          () => {
                            console.log('Submit from permissionDelete modal!');
                          },
                          () => {
                            console.log('Cancel from permissionDelete modal');
                          }
                        )
                      );
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          }}
        /> */}
      </fieldset>
      <p className="flex">
        <Link to={`/organizations/${orgId}/edit`}>&laquo; Organization details</Link>
        <Link to={`/organizations/${orgId}/edit/roles`} className="ml-auto">
          Roles &raquo;
        </Link>
      </p>
    </React.Fragment>
  );
};

OrgEditPermissions.propTypes = {
  orgId: PropTypes.string,
};

export default OrgEditPermissions;
