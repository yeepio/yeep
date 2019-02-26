import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Pillbox = ({ id, label, checked, className }) => {
  return (
    <label
      htmlFor={id}
      className={classNames(
        'rounded',
        'border-grey-dark',
        'border',
        'p-2',
        'inline-block',
        'cursor-pointer',
        {
          'bg-blue-lightest border-blue hover:bg-blue-light': checked,
          'hover:bg-grey-light': !checked,
        },
        className
      )}
    >
      <input type="checkbox" id={id} className="cursor-pointer" checked={checked} /> {label}
    </label>
  );
};

Pillbox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  className: PropTypes.string,
};

Pillbox.defaultProps = {
  checked: false,
};

export default Pillbox;
