import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ width, height, src, radius }) => {
  return (
    <div
      className="bg-cover bg-no-repeat bg-grey-dark"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: radius,
        backgroundImage: src && `url("${src}")`,
      }}
    />
  );
};

Avatar.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  src: PropTypes.string,
  radius: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Avatar.defaultProps = {
  radius: '50%',
};

export default Avatar;
