import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import Grid from '../../components/Grid';

const headings = [
  { label: 'Name', isSortable: false, className: 'text-left' },
  { label: 'User count', isSortable: false },
  { label: 'Role count', isSortable: false },
  { label: 'Permission count', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const OrgGrid = ({
  className,
  isLoading,
  records,
  totalCount,
  page,
  pageSize,
  onRecordEdit,
  getRecordEditLink,
  onRecordDelete,
  onPageNext,
  onPagePrevious,
  onLimitChange,
}) => {
  const entitiesStart = React.useMemo(() => page * pageSize + 1, [page, pageSize]);
  const entitiesEnd = React.useMemo(
    () => (records.length >= pageSize ? (page + 1) * pageSize : records.length),
    [records, page, pageSize]
  );

  return (
    <Grid
      className={className}
      headings={headings}
      data={records}
      entitiesStart={entitiesStart}
      entitiesEnd={entitiesEnd}
      totalCount={totalCount}
      hasNext={records.length >= pageSize}
      hasPrevious={page > 0}
      onNextClick={onPageNext}
      onPreviousClick={onPagePrevious}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      renderer={(org, index) => {
        return (
          <tr key={`row${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
            <td className="p-2">
              {org.isSystemPermission ? (
                org.name
              ) : getRecordEditLink ? (
                <Link to={getRecordEditLink(org)}>{org.name}</Link>
              ) : (
                <button onClick={() => onRecordEdit(org)} className="pseudolink">
                  {org.name}
                </button>
              )}
            </td>
            <td className="p-2 text-center">
              <a href="/">{org.usersCount}</a>
            </td>
            <td className="p-2 text-center">
              <a href="/">{org.rolesCount}</a>
            </td>
            <td className="p-2 text-center">
              <a href="/">{org.permissionsCount}</a>
            </td>
            <td className="p-2 text-center">
              {getRecordEditLink ? (
                <Link to={getRecordEditLink(org)}>Edit</Link>
              ) : (
                <button onClick={() => onRecordEdit(org)} className="pseudolink">
                  Edit
                </button>
              )}{' '}
              <button onClick={() => onRecordDelete(org)} className="pseudolink">
                Delete
              </button>
            </td>
          </tr>
        );
      }}
    />
  );
};

OrgGrid.propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  records: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onRecordEdit: PropTypes.func,
  getRecordEditLink: PropTypes.func, // when specified will render a link instead of a button (useful for "open in new tab")
  onRecordDelete: PropTypes.func.isRequired,
  onPageNext: PropTypes.func.isRequired,
  onPagePrevious: PropTypes.func.isRequired,
  onLimitChange: PropTypes.func.isRequired,
};

export default OrgGrid;
