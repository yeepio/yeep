import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Modal(props) {
  // Hide the currently showing modal on ESC keypress
  // This will be an effect (with cleanup).
  // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects for details
  useEffect(() => {
    const handleESC = (e) => {
      if (e.key === 'Escape') {
        props.onClose();
      }
    };
    window.addEventListener('keydown', handleESC);
    return () => {
      window.removeEventListener('keydown', handleESC);
    };
  });

  // Use a portal for the modal
  // to attach it as a child of <div id="root">
  return ReactDOM.createPortal(
    <div
      className={classNames(
        'modalOverlay',
        'fixed',
        'flex',
        'inset-0',
        'w-full',
        'h-full',
        'items-center',
        'justify-center'
      )}
    >
      <div
        className={classNames(
          'modal',
          'w-full',
          'h-full',
          {'sm:w-auto' : !props.fullWidth},
          'sm:h-auto',
          'max-w-lg',
          'relative',
          'bg-white',
          'p-4',
          'sm:p-8',
          props.className
        )}
      >
        <button
          onClick={props.onClose}
          className={classNames(
            'modalClose',
            'absolute',
            'w-8',
            'h-8',
            'sm:w-4',
            'sm:h-4',
            'right-0',
            'top-0',
            'mt-2',
            'mr-2'
          )}
        />
        {props.children}
      </div>
    </div>,
    document.getElementById('portal')
  );
}

Modal.propTypes = {
  // Parent component needs to send an onClose handler
  onClose: PropTypes.func.isRequired,
  // If "fullWidth" prop is specified, sm:w-auto class will be removed
  // so that the modal contents can greedily take the full width of the
  // modal (up to .max-w-lg)
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,

};

export default Modal;
