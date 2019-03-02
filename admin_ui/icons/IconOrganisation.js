import React from 'react';
import PropTypes from 'prop-types';
import calculateScale from '../utilities/calculateScale';

const IconOrganisation = ({ color, width, height, className }) => {
  const defaultWidth = IconOrganisation.defaultProps.width;
  const defaultHeight = IconOrganisation.defaultProps.height;
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
        <path d="M23.25 13.846h-1.5V10a.76.76 0 0 0-.75-.77h-8.25V6.155h1.5a.76.76 0 0 0 .75-.77V.77A.76.76 0 0 0 14.25 0h-4.5A.76.76 0 0 0 9 .77v4.615c0 .424.336.769.75.769h1.5V9.23H3a.76.76 0 0 0-.75.769v3.846H.75a.76.76 0 0 0-.75.77v4.615c0 .424.336.769.75.769h4.5a.76.76 0 0 0 .75-.77v-4.615a.76.76 0 0 0-.75-.769h-1.5V10.77h7.5v3.077h-1.5a.76.76 0 0 0-.75.77v4.615c0 .424.336.769.75.769h4.5a.76.76 0 0 0 .75-.77v-4.615a.76.76 0 0 0-.75-.769h-1.5V10.77h7.5v3.077h-1.5a.76.76 0 0 0-.75.77v4.615c0 .424.336.769.75.769h4.5a.76.76 0 0 0 .75-.77v-4.615a.76.76 0 0 0-.75-.769z" />
      </g>
    </svg>
  );
};

IconOrganisation.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

IconOrganisation.defaultProps = {
  width: 24,
  height: 20,
  color: '#313131',
  className: '',
};

export default IconOrganisation;
