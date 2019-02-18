import React from 'react';
import PropTypes from 'prop-types';

const Pillbox = ({ id, label, checked, className }) => {
  // Prep Tailwind styles
  let styles = ['rounded', 'border-grey-dark', 'border', 'p-2', 'inline-block', 'cursor-pointer'];
  if (checked) {
    styles = [...styles, 'bg-blue-lightest', 'border-blue', 'hover:bg-blue-light'];
  } else {
    styles = [...styles, 'hover:bg-grey-light'];
  }
  // User might have supplied a custom className(s)
  if (className) {
    styles.push(' ' + className);
  }
  return (
    <label htmlFor={id} className={styles.join(' ')}>
      <input type="checkbox" id={id} className="cursor-pointer" checked={checked} />{' '}
      {label}
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
