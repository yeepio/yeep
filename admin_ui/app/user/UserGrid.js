import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';
import Grid from '../../components/Grid';
import getUserPrimaryEmail from '../../utilities/getUserPrimaryEmail';

const headings = [
  { label: 'Username', isSortable: false, className: 'text-left' },
  { label: 'Full name', isSortable: false, className: 'text-left' },
  { label: 'Primary email', isSortable: false, className: 'text-left' },
  { label: 'Verified?', isSortable: false },
  { label: 'Orgs', isSortable: false },
  { label: 'Actions', isSortable: false },
];

const UserGrid = ({
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
      renderer={(user, index) => {
        const primaryEmail = getUserPrimaryEmail(user.emails);
        return (
          <tr key={`row${index}`} className={index % 2 ? 'bg-grey-lightest' : ''}>
            <td className="p-2">
              {getRecordEditLink ? (
                <Link to={getRecordEditLink(user)}>{user.username}</Link>
              ) : (
                <button onClick={() => onRecordEdit(user)} className="pseudolink">
                  {user.username}
                </button>
              )}
            </td>
            <td className="p-2">
              {getRecordEditLink ? (
                <Link to={getRecordEditLink(user)}>{user.fullName}</Link>
              ) : (
                <button onClick={() => onRecordEdit(user)} className="pseudolink">
                  {user.fullName}
                </button>
              )}
            </td>
            <td className="p-2">{primaryEmail && primaryEmail.address.toLowerCase()}</td>
            <td className="p-2 text-center">
              {primaryEmail && primaryEmail.isVerified ? (
                <img src="/icon-yes.svg" alt="Verified email" width={16} />
              ) : (
                <img src="/icon-no.svg" alt="Non-verified email" width={16} />
              )}
            </td>
            <td className="p-2 text-center">{user.orgs.length}</td>
            <td className="p-2 text-center">
              {getRecordEditLink ? (
                <Link to={getRecordEditLink(user)}>Edit</Link>
              ) : (
                <button onClick={() => onRecordEdit(user)} className="pseudolink">
                  Edit
                </button>
              )}{' '}
              <button onClick={() => onRecordDelete(user)} className="pseudolink">
                Remove
              </button>
            </td>
          </tr>
        );
      }}
    />
  );
};

UserGrid.propTypes = {
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

export default UserGrid;
