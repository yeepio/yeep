import React from 'react';
import PropTypes from 'prop-types';
import GridSortingLink from './GridSortingLink';

const GridHeadingCell = ({label, isSortable, sort, className}) => {
  return (
    <th className={`border-grey border-t border-b p-2 font-normal ${className}`}>
      {isSortable && <GridSortingLink direction={sort}>{label}</GridSortingLink>}
      {!isSortable && label}
    </th>
  );
};

GridHeadingCell.propTypes = {
  label: PropTypes.string.isRequired,
  isSortable: PropTypes.bool,
  sort: PropTypes.oneOf(['asc','desc']),
  className: PropTypes.string
};

GridHeadingCell.defaultProps = {
  isSortable: true,
  sort: null
};

export default GridHeadingCell;