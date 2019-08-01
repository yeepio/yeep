import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import noop from 'lodash/noop';

// WIP
const GridPager = ({ hasNext, hasPrevious, onNextClick, onPreviousClick }) => {
  return (
    <React.Fragment>
      <ul className="ml-auto whitespace-no-wrap">
        <li className="px-2 inline-block">
          <button
            className={classnames({
              'opacity-50 cursor-not-allowed': !hasPrevious,
            })}
            disabled={!hasPrevious}
            onClick={onPreviousClick}
          >
            &laquo; Previous
          </button>
        </li>
{/*        <li className="px-2 inline-block">
          <a href="/">1</a>
        </li>
        <li className="px-2 inline-block">
          <strong>2</strong>
        </li>
        <li className="px-2 inline-block">...</li>
        <li className="px-2 inline-block">
          <a href="/">7</a>
        </li>*/}
        <li className="px-2 inline-block">
          <button
            className={classnames({
              'opacity-50 cursor-not-allowed': !hasNext,
            })}
            disabled={!hasNext}
            onClick={onNextClick}
          >
            Next &raquo;
          </button>
        </li>
      </ul>
    </React.Fragment>
  );
};

GridPager.propTypes = {
  hasNext: PropTypes.bool,
  hasPrevious: PropTypes.bool,
  onNextClick: PropTypes.func,
  onPreviousClick: PropTypes.func,
};

GridPager.defaultProps = {
  hasNext: true,
  hasPrevious: true,
  onNextClick: noop,
  onPreviousClick: noop,
};


export default GridPager;
