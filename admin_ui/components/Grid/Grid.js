import React from 'react';
import GridPager from './GridPager';
import GridPerPage from './GridPerPage';
import GridHeadingCell from './GridHeadingCell';
import GridLoadingOverlay from './GridLoadingOverlay';
import PropTypes from 'prop-types';

// WIP
const Grid = ({ headings, data, renderer, isLoading }) => {
  return (
    <div className="grid relative">
      {isLoading && <GridLoadingOverlay />}
      <div className="py-2 text-center sm:flex sm:text-left">
        <p>
          Showing entities <strong>1</strong> to <strong>X</strong> of <strong>TOTAL</strong>:
        </p>
        <GridPager />
      </div>
      <style jsx>{`
        .grid-wrapper {
          max-width: calc(100vw - 2rem);
        }
      `}</style>
      <div className="grid-wrapper overflow-x-auto scrolling-touch">
        <table className="grid w-full border-collapse border-b border-grey">
          <thead>
            <tr>
              {headings.map((heading) => (
                <GridHeadingCell
                  key={heading.label}
                  label={heading.label}
                  isSortable={heading.isSortable}
                  sort={heading.sort}
                  className={heading.className}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              return renderer(row, i);
            })}
          </tbody>
        </table>
      </div>
      <div className="sm:flex flex-row text-center items-center py-2">
        <GridPerPage />
        <GridPager />
      </div>
    </div>
  );
};

Grid.propTypes = {
  /*
    headings is an array of objects that look like this:
    {
      label: 'Name',
      isSortable: true,
      sort: 'asc',
      className: 'text-left',
    }
    Each element of the array will get passed to <GridHeadingCell />
   */
  headings: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      sort: PropTypes.oneOf(['asc', 'desc']),
      isSortable: PropTypes.bool,
      className: PropTypes.string,
    })
  ),
  // The data for the grid
  data: PropTypes.array.isRequired,
  // The function resposible for parsing each element of the "data" array above
  // and returning the apporpriate markup
  renderer: PropTypes.func,
  // Shows an overlay (effectively disabling the controls) if we're loading data
  isLoading: PropTypes.bool,
};

Grid.defaultProps = {
  isLoading: false,
};

export default Grid;
