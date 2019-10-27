import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({size}) => {
  let borderWidth = parseInt(size / 10, 10);
  return (
    <React.Fragment>
      <div className="spinner"/>
      <style jsx>{`
        .spinner {
          background-color: rgba(255, 255, 255, 0.8);
          // To ensure we're above any Select component
          z-index: 2;
        }
        .spinner,
        .spinner:after {
          border-radius: 50%;
          width: ${size}px;
          height: ${size}px;
        }
        .spinner {
          font-size: 10px;
          position: relative;
          text-indent: -9999em;
          border-top: ${borderWidth}px solid rgba(0, 0, 0, 0.1);
          border-right: ${borderWidth}px solid rgba(0, 0, 0, 0.1);
          border-bottom: ${borderWidth}px solid rgba(0, 0, 0, 0.1);
          border-left: ${borderWidth}px solid #ffffff;
          transform: translateZ(0);
          animation: load8 1.1s infinite linear;
        }
        @keyframes load8 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </React.Fragment>
  );
};

Spinner.propTypes = {
  size: PropTypes.number
};

Spinner.defaultProps = {
  size: 88
};

export default Spinner;
