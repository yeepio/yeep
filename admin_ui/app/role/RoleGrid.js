import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { Link } from '@reach/router';
import Grid from '../../components/Grid';

const headings = [
  { label: 'Role name', className: 'text-left', isSortable: false },
  { label: 'Permissions', isSortable: false },
  { label: 'System role?', isSortable: false },
  { label: 'Org scope', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const RoleGrid = ({
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
    () => (records.length >= pageSize ? (page + 1) * pageSize : totalCount),
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
      renderer={(role, index) => {
        return (
          <tr key={`row${index}`} className={index % 2 ? `bg-grey-lightest` : ``}>
            <td className="p-2">
              {role.isSystemRole ? (
                role.name
              ) : getRecordEditLink ? (
                <Link to={getRecordEditLink(role)}>{role.name}</Link>
              ) : (
                <button onClick={() => onRecordEdit(role)} className="pseudolink">
                  {role.name}
                </button>
              )}
            </td>
            <td className="p-2 text-center">{role.permissions.length}</td>
            <td className="p-2 text-center">{role.isSystemRole ? 'Yes' : '-'}</td>
            <td className="p-2 text-center">{get(role.org, ['name'], '-')}</td>
            <td className="p-2 text-center">
              {role.isSystemRole ? (
                <span className="text-grey">Cannot modify</span>
              ) : (
                <React.Fragment>
                  {getRecordEditLink ? (
                    <Link to={getRecordEditLink(role)}>Edit</Link>
                  ) : (
                    <button onClick={() => onRecordEdit(role)} className="pseudolink">
                      Edit
                    </button>
                  )}{' '}
                  <button onClick={() => onRecordDelete(role)} className="pseudolink">
                    Delete
                  </button>
                </React.Fragment>
              )}
            </td>
          </tr>
        );
      }}
    />
  );
};

RoleGrid.propTypes = {
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

export default RoleGrid;
