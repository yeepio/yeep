import React from 'react';
import PropTypes from 'prop-types';

const GridSortingLink = ({ children, direction }) => {
  let sortClass = "grid-sorting";
  if (direction) {
    sortClass += "-" + direction;
  }
  return (
    <React.Fragment>
      <a href="/" className={`${sortClass} no-underline text-black inline-block pr-5 cursor-pointer`}>
        {children}
      </a>
      <style jsx global>{`
        .grid-sorting {
          background: url(data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///xUVFf///yH5BAEAAAMALAAAAAALAAsAAAIUnC2nKLnT4or00PvyrQwrPzUZshQAOw==)
            no-repeat center right;
        }
        .grid-sorting-asc {
          background: url(data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///xUVFf///yH5BAEAAAMALAAAAAALAAsAAAIRnC2nKLnT4or00Puy3rx7VQAAOw==)
            no-repeat center right;
        }
        .grid-sorting-desc {
          background: url(data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///xUVFf///yH5BAEAAAMALAAAAAALAAsAAAIPnI+py+0/hJzz0IruwjsVADs=)
            no-repeat center right;
        }
      `}</style>
    </React.Fragment>
  );
};

GridSortingLink.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf([false, 'asc', 'desc']),
};

GridSortingLink.defaultProps = {
  direction: false,
};

export default GridSortingLink;
