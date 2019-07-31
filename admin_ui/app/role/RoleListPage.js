import React, { useCallback, useEffect } from 'react';
import { Link } from '@reach/router';
import useDocumentTitle from '@rehooks/document-title';
import { useSelector, useDispatch } from 'react-redux';
import ButtonLink from '../../components/ButtonLink';
import Select from 'react-select';
import Grid from '../../components/Grid';
import Input from '../../components/Input';
import RoleDeleteModal from '../modals/RoleDeleteModal';
import { openRoleDeleteModal } from '../modals/roleModalsStore';
import { listRoles, updateRoleListLimit } from './roleStore';

// Dummy data
let roleHeadings = [
  { label: 'Role name', className: 'text-left', isSortable: false},
  { label: 'Permissions', isSortable: false},
  { label: 'System role?', isSortable: false},
  { label: 'Users', isSortable: false},
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const RoleListPage = () => {
  const isRoleListLoading = useSelector((state) => state.role.isRoleListLoading);
  const roleData = useSelector((state) => state.role.roles);
  const nextRoleListCursor = useSelector((state) => state.role.nextRoleListCursor);
  const previousRoleListCursor = useSelector((state) => state.role.previousRoleListCursor);
  const roleListLimit = useSelector((state) => state.role.roleListLimit);
  // const loginErrors = useSelector((state) => state.session.loginErrors);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(listRoles({ limit: 10 }));
  }, [dispatch]);

  useDocumentTitle('Roles');

  const handleDelete = useCallback(() => {
    dispatch(
      openRoleDeleteModal(
        {
          id: 1,
          name: 'role_name',
        },
        () => {
          console.log('Submit from roleDelete modal!');
        },
        () => {
          console.log('Cancel from roleDelete modal');
        }
      )
    );
  }, [dispatch]);

  const handleNext = useCallback(() => {
    dispatch(listRoles({ limit: roleListLimit, cursor: nextRoleListCursor }));
  }, [dispatch, nextRoleListCursor, roleListLimit]);

  const handlePrevious = useCallback(() => {
    dispatch(listRoles({ limit: roleListLimit, cursor: previousRoleListCursor }));
  }, [dispatch, previousRoleListCursor, roleListLimit]);

  const handleLimitChange = useCallback((event) => {
    const newLimit = event.value;
    dispatch(updateRoleListLimit({ limit: newLimit }));
  }, [dispatch, previousRoleListCursor, roleListLimit]);

  return (
    <React.Fragment>
      <RoleDeleteModal />
      <ButtonLink to="create" className="float-right">
        Create new
      </ButtonLink>
      <h1 className="font-semibold text-3xl mb-6">Roles</h1>
      <fieldset className="mb-6">
        <legend>Filters and quick search</legend>
        <div className="sm:flex items-center">
          <Select
            className="flex-auto mb-3 sm:mb-0 sm:mr-3"
            placeholder="All organisations"
            options={[
              { value: 1, label: 'Org 1' },
              { value: 2, label: 'Org 2' },
              { value: 3, label: 'Org 3' },
              { value: 4, label: 'Org 4' },
            ]}
            isClearable={true}
          />
          <label htmlFor="showSystemRoles" className="block flex-initial mb-3 sm:mb-0 sm:mr-3">
            <input type="checkbox" id="showSystemRoles" className="mr-2" />
            Show system roles
          </label>
          <Input placeholder="quicksearch" className="w-full sm:w-1/3" />
        </div>
      </fieldset>
      <Grid
        className="mb-6"
        headings={roleHeadings}
        data={roleData}
        hasNext={!!nextRoleListCursor}
        hasPrevious={!!previousRoleListCursor}
        onNextClick={handleNext}
        onPreviousClick={handlePrevious}
        onLimitChange={handleLimitChange}
        isLoading={isRoleListLoading}
        renderer={(roleData, index) => {
          return (
            <tr key={`roleRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
              <td className="p-2">
                <Link to={`${roleData.id}/edit`}>{roleData.name}</Link>
              </td>
              <td className="p-2 text-center">{roleData.permissions.length}</td>
              <td className="p-2 text-center">{roleData.isSystemRole ? 'Yes' : '-'}</td>
              <td className="p-2 text-center">{roleData.usersCount}</td>
              <td className="p-2 text-center">
                {roleData.org ? roleData.org : '-'}
              </td>
              <td className="p-2 text-center">
                <Link to={`${roleData.id}/edit`}>Edit</Link>{' '}
                <button onClick={handleDelete} className="pseudolink">
                  Delete
                </button>
              </td>
            </tr>
          );
        }}
      />
      <p>
        <Link to="..">Return to the dashboard</Link>
      </p>
    </React.Fragment>
  );
};

export default RoleListPage;
