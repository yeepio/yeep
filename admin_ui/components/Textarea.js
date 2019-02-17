import React from 'react';
import PropTypes from 'prop-types';

const Textarea = ({
  id,
  className,
  rows,
  label,
  labelClassName,
  placeholder,
  feedbackValid,
  feedbackInvalid,
  feedbackNeutral,
}) => {
  return (
    <React.Fragment>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        id={id}
        className={`block border border-grey p-2 rounded w-full leading-normal ${className}`}
        placeholder={placeholder}
      />
      {feedbackInvalid && <div className="invalid">{feedbackInvalid}</div>}
      {feedbackValid && <div className="valid">{feedbackValid}</div>}
      {feedbackNeutral && <div className="neutral">{feedbackNeutral}</div>}
    </React.Fragment>
  );
};

Textarea.propTypes = {
  // The id of the input field
  id: PropTypes.string.required,
  // The class that will be applied to the input field
  className: PropTypes.string,
  // Height of the element in number of text rows
  rows: PropTypes.number,
  // The placeholder attribute of the input field
  placeholder: PropTypes.string,
  // If filled we'll display a <label> element with that text
  label: PropTypes.string,
  // The class of the <label> element
  labelClassName: PropTypes.string,
  // Draws a positive feedback message under the input field
  feedbackValid: PropTypes.string,
  // Draws a negative / error feedback message under the input field
  feedbackInvalid: PropTypes.string,
  // Draws a neutral (gray) message under the input field
  feedbackNeutral: PropTypes.string,
};

Textarea.defaultProps = {
  rows: 8,
};

export default Textarea;
