import React from 'react';
import PropTypes from 'prop-types';
import calculateScale from '../utilities/calculateScale';

const IconHome = ({ color, width, height, className }) => {
  const defaultWidth = IconHome.defaultProps.width;
  const defaultHeight = IconHome.defaultProps.height;
  const scale = calculateScale({ width, height, defaultWidth, defaultHeight });
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={defaultWidth * scale}
      height={defaultHeight * scale}
      viewBox={`0 0 ${defaultWidth * scale} ${defaultHeight * scale}`}
      className={className}
    >
      <g fill={color} transform={`scale(${scale})`} fillRule="evenodd">
        <path d="M12.008 4.073L3.48 11.428a.22.22 0 0 1-.008.046.221.221 0 0 0-.007.047v7.448c0 .268.094.502.282.698.188.196.41.295.667.295h5.695v-5.959h3.797v5.96h5.695c.257 0 .48-.1.668-.296a.976.976 0 0 0 .282-.698V11.52a.227.227 0 0 0-.015-.093l-8.528-7.355z" />
        <path d="M23.799 9.752L20.55 6.928V.598a.495.495 0 0 0-.134-.358.45.45 0 0 0-.341-.14h-2.848a.452.452 0 0 0-.34.14.496.496 0 0 0-.134.357v3.026L13.135.457a1.683 1.683 0 0 0-1.127-.403c-.435 0-.81.134-1.127.403L.217 9.752a.458.458 0 0 0-.163.334c-.01.14.024.261.103.364l.92 1.149a.5.5 0 0 0 .311.17.534.534 0 0 0 .356-.108l10.264-8.954 10.263 8.954c.08.072.183.108.312.108h.044a.5.5 0 0 0 .312-.17l.92-1.149a.518.518 0 0 0 .103-.365.46.46 0 0 0-.163-.333z" />
      </g>
    </svg>
  );
};

IconHome.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string
};

IconHome.defaultProps = {
  width: 24,
  height: 20,
  color: '#313131',
  className: '',
};

export default IconHome;
