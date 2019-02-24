import React from 'react';
import PropTypes from 'prop-types';
import calculateScale from '../utilities/calculateScale';

const IconPermission = ({ color, width, height, className }) => {
  const defaultWidth = IconPermission.defaultProps.width;
  const defaultHeight = IconPermission.defaultProps.height;
  const scale = calculateScale({ width, height, defaultWidth, defaultHeight });
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={defaultWidth * scale}
      height={defaultHeight * scale}
      viewBox={`0 0 ${defaultWidth * scale} ${defaultHeight * scale}`}
      className={className}
    >
      <g fill={color} transform={`scale(${scale})`} fillRule="nonzero">
        <path d="M19.124 15.393c.187.21.355.395.503.55.148.157.307.308.477.455.17.147.294.22.372.22.148 0 .435-.225.862-.675.426-.45.64-.752.64-.909 0-.073-.125-.261-.373-.564a21.964 21.964 0 0 0-.953-1.075 95.804 95.804 0 0 0-1.13-1.184c-.365-.377-.722-.742-1.07-1.096a88.241 88.241 0 0 1-.601-.612.403.403 0 0 0-.3-.138c-.148 0-.436.225-.862.675-.427.45-.64.753-.64.909 0 .082.07.213.209.392.14.18.283.347.43.503.149.156.323.333.523.53l.34.338-1.254 1.322-4.636-4.89c1.14-1.616 1.711-3.292 1.711-5.027 0-1.497-.446-2.716-1.338-3.657C11.14.518 9.986.048 8.566.048c-1.392 0-2.755.436-4.087 1.308a10.216 10.216 0 0 0-3.238 3.416C.414 6.177 0 7.615 0 9.084c0 1.497.446 2.715 1.339 3.657.892.941 2.048 1.412 3.467 1.412 1.645 0 3.234-.601 4.766-1.805l8.762 9.243c.244.257.54.386.888.386.366 0 .719-.18 1.058-.538.34-.358.51-.73.51-1.115 0-.368-.123-.68-.366-.937l-2.873-3.03 1.253-1.323c.026.028.133.147.32.359zm-8.99-8.182a2.356 2.356 0 0 1-1.776.771c-.366 0-.727-.087-1.084-.262.165.377.248.758.248 1.143 0 .735-.244 1.36-.731 1.874a2.357 2.357 0 0 1-1.776.771 2.356 2.356 0 0 1-1.776-.771c-.488-.514-.732-1.139-.732-1.874 0-.734.244-1.359.732-1.873a2.356 2.356 0 0 1 1.776-.771c.365 0 .726.087 1.083.262a2.82 2.82 0 0 1-.248-1.144c0-.734.244-1.359.731-1.873a2.357 2.357 0 0 1 1.776-.771c.697 0 1.289.257 1.776.77.488.515.732 1.14.732 1.874 0 .735-.244 1.36-.731 1.874z" />
      </g>
    </svg>
  );
};

IconPermission.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

IconPermission.defaultProps = {
  width: 22,
  height: 22,
  color: '#313131',
  className: '',
};

export default IconPermission;
