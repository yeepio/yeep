import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  id,
  className,
  type,
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
      <input type={type} id={id} className={className} placeholder={placeholder} />
      {feedbackInvalid && <div className="invalid">{feedbackInvalid}</div>}
      {feedbackValid && <div className="valid">{feedbackValid}</div>}
      {feedbackNeutral && <div className="neutral">{feedbackNeutral}</div>}
    </React.Fragment>
  );
};

Input.propTypes = {
  // The id of the input field
  id: PropTypes.string.required,
  // The class that will be applied to the input field
  className: PropTypes.string,
  // The type of the input field.
  // TODO: Discuss whether we should relax this and just accept a string
  type: PropTypes.oneOf(['text', 'password', 'email']),
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
  feedbackNeutral: PropTypes.string
};

Input.defaultProps = {
  type: 'text'
};

export default Input;
