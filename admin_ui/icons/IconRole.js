import React from 'react';
import PropTypes from 'prop-types';
import calculateScale from '../utilities/calculateScale';

const IconRole = ({ color, width, height, className }) => {
  const defaultWidth = IconRole.defaultProps.width;
  const defaultHeight = IconRole.defaultProps.height;
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
        <path d="M14.327 3.506a4.28 4.28 0 0 1 2.008 3.182c.448.208.945.327 1.472.327 1.923 0 3.482-1.547 3.482-3.456 0-1.91-1.56-3.457-3.482-3.457-1.905 0-3.45 1.52-3.48 3.404zm-2.28 7.078c1.922 0 3.481-1.548 3.481-3.457 0-1.909-1.559-3.456-3.482-3.456-1.923 0-3.482 1.548-3.482 3.456 0 1.91 1.56 3.457 3.482 3.457zm1.476.235H10.57c-2.459 0-4.459 1.986-4.459 4.426v3.587l.01.056.248.077c2.346.728 4.385.97 6.062.97 3.277 0 5.176-.927 5.293-.986l.233-.117h.025v-3.587c0-2.44-2-4.426-4.458-4.426zm5.761-3.568h-2.932a4.246 4.246 0 0 1-1.324 2.967c2.185.645 3.784 2.656 3.784 5.032v1.106c2.895-.106 4.563-.92 4.673-.975l.232-.117h.025v-3.588c0-2.44-2-4.425-4.458-4.425zM5.936 7.016c.681 0 1.315-.198 1.852-.534a4.272 4.272 0 0 1 1.62-2.728c.004-.065.01-.129.01-.194 0-1.91-1.56-3.457-3.482-3.457-1.923 0-3.482 1.548-3.482 3.457 0 1.908 1.559 3.456 3.482 3.456zm3.127 3.202a4.248 4.248 0 0 1-1.323-2.95c-.109-.009-.216-.017-.327-.017H4.458C2 7.25 0 9.236 0 11.676v3.588l.01.055.248.078c1.882.583 3.562.852 5.02.937V15.25c.001-2.376 1.6-4.386 3.785-5.032z" />
      </g>
    </svg>
  );
};

IconRole.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

IconRole.defaultProps = {
  width: 24,
  height: 20,
  color: '#313131',
  className: '',
};

export default IconRole;
