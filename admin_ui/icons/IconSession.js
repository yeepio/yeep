import React from 'react';
import PropTypes from 'prop-types';
import calculateScale from '../utilities/calculateScale';

const IconSession = ({ color, width, height, className }) => {
  const defaultWidth = IconSession.defaultProps.width;
  const defaultHeight = IconSession.defaultProps.height;
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
        <path
          d="M19.6 23.2h-1.2v-1.6h-2v-4.089c0-1.08-.537-2.083-1.436-2.682L10.721 12l4.243-2.829A3.218 3.218 0 0 0 16.4 6.49V2.4h2V.8h1.2a.4.4 0 1 0 0-.8H.4a.4.4 0 1 0 0 .8h1.2v1.6h2v4.089c0 1.08.537 2.083 1.436 2.682L9.279 12l-4.243 2.829A3.218 3.218 0 0 0 3.6 17.51V21.6h-2v1.6H.4a.4.4 0 1 0 0 .8h19.2a.4.4 0 1 0 0-.8zM5.48 8.506A2.42 2.42 0 0 1 4.4 6.489V2.4h11.2v4.089a2.42 2.42 0 0 1-1.08 2.017L10 11.519 5.48 8.506zM4.4 17.51a2.42 2.42 0 0 1 1.08-2.017L10 12.481l4.52 3.013a2.42 2.42 0 0 1 1.08 2.017V21.6H4.4v-4.089z"
          fillRule="nonzero"
        />
        <path d="M6.367 7.174A.823.823 0 0 1 6 6.49V5.6a.4.4 0 1 0-.8 0v.889c0 .544.27 1.05.723 1.351l1.855 1.237a.4.4 0 1 0 .444-.666L6.367 7.174zM14.077 16.504l-1.855-1.237a.4.4 0 1 0-.444.666l1.855 1.237c.23.153.367.409.367.685v.889a.4.4 0 1 0 .8 0v-.889c0-.545-.27-1.05-.723-1.351z" />
      </g>
    </svg>
  );
};

IconSession.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

IconSession.defaultProps = {
  width: 22,
  height: 24,
  color: '#313131',
  className: '',
};

export default IconSession;
