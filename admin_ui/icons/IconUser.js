import React from 'react';
import PropTypes from 'prop-types';
import calculateScale from '../utilities/calculateScale';

const IconUser = ({ color, width, height, className }) => {
  const defaultWidth = IconUser.defaultProps.width;
  const defaultHeight = IconUser.defaultProps.height;
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
        <path d="M10.987 11.987c1.653 0 3.063-.585 4.232-1.756 1.169-1.17 1.753-2.583 1.753-4.238 0-1.654-.584-3.066-1.753-4.237C14.049.586 12.639 0 10.987 0 9.335 0 7.924.585 6.756 1.756c-1.17 1.17-1.754 2.583-1.754 4.237 0 1.655.585 3.068 1.754 4.238 1.169 1.17 2.579 1.756 4.231 1.756z" />
        <path d="M21.905 18.316a16.002 16.002 0 0 0-.218-1.701 13.25 13.25 0 0 0-.414-1.694 8.038 8.038 0 0 0-.67-1.521 5.481 5.481 0 0 0-.966-1.265 4.068 4.068 0 0 0-1.333-.835 4.68 4.68 0 0 0-1.738-.312c-.093 0-.311.112-.654.336-.343.224-.73.473-1.161.75-.431.275-.993.525-1.683.748a6.719 6.719 0 0 1-2.081.336c-.697 0-1.39-.112-2.08-.336-.692-.223-1.253-.473-1.684-.749a151.96 151.96 0 0 1-1.161-.75c-.343-.223-.561-.335-.655-.335-.634 0-1.213.104-1.738.312a4.067 4.067 0 0 0-1.332.835c-.364.349-.686.77-.966 1.265A8.05 8.05 0 0 0 .7 14.92c-.167.52-.305 1.085-.414 1.694-.109.609-.181 1.176-.218 1.701a23.418 23.418 0 0 0-.054 1.616c0 1.248.379 2.235 1.137 2.958.759.723 1.767 1.084 3.024 1.084h13.622c1.257 0 2.265-.361 3.024-1.084.759-.723 1.138-1.71 1.138-2.958 0-.551-.018-1.09-.055-1.616z" />
      </g>
    </svg>
  );
};

IconUser.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
};

IconUser.defaultProps = {
  width: 22,
  height: 24,
  color: '#313131',
  className: '',
};

export default IconUser;
