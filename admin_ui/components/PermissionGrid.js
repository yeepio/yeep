import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Link } from '@reach/router';
import Grid from './Grid';

const headings = [
  {
    label: 'Name',
    className: 'text-left',
    isSortable: false,
  },
  { label: 'System permission', isSortable: false },
  { label: 'Role assignments', isSortable: false },
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const PermissionGrid = ({
  className,
  isLoading,
  records,
  totalCount,
  page,
  limit,
  onRecordEdit,
  getRecordEditLink,
  onRecordDelete,
  onPageNext,
  onPagePrevious,
  onLimitChange,
}) => {
  const entitiesStart = React.useMemo(() => page * limit + 1, [page, limit]);
  const entitiesEnd = React.useMemo(
    () => (records.length >= limit ? (page + 1) * limit : records.length),
    [records, page, limit]
  );

  return (
    <Grid
      className={className}
      headings={headings}
      data={records}
      entitiesStart={entitiesStart}
      entitiesEnd={entitiesEnd}
      totalCount={totalCount}
      hasNext={records.length >= limit}
      hasPrevious={page > 0}
      onNextClick={onPageNext}
      onPreviousClick={onPagePrevious}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      renderer={(permission, index) => {
        return (
          <tr key={`permissionRow${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
            <td className="p-2">
              {getRecordEditLink ? (
                <Link to={getRecordEditLink(permission)}>{permission.name}</Link>
              ) : (
                permission.name
              )}
            </td>
            <td className="p-2 text-center">{permission.isSystemPermission ? 'Yes' : '-'}</td>
            <td className="p-2 text-center">{permission.roles.length}</td>
            <td className="p-2 text-center">{get(permission.org, ['name'], '-')}</td>
            <td className="p-2 text-center">
              {!permission.isSystemPermission && (
                <React.Fragment>
                  {getRecordEditLink ? (
                    <Link to={getRecordEditLink(permission)}>Edit</Link>
                  ) : (
                    <button onClick={() => onRecordEdit(permission)} className="pseudolink">
                      Edit
                    </button>
                  )}{' '}
                  <button onClick={() => onRecordDelete(permission)} className="pseudolink">
                    Delete
                  </button>
                </React.Fragment>
              )}
              {permission.isSystemPermission && <span className="text-grey">Cannot modify</span>}
            </td>
          </tr>
        );
      }}
    />
  );
};

PermissionGrid.propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  records: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  onRecordEdit: PropTypes.func,
  getRecordEditLink: PropTypes.func, // when specified will render a link instead of a button (useful for "open in new tab")
  onRecordDelete: PropTypes.func.isRequired,
  onPageNext: PropTypes.func.isRequired,
  onPagePrevious: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
};

export default PermissionGrid;
