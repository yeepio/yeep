import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Modal(props) {
  // Invoke the `onClose` (required) prop when ESC key is pressed
  const handleESC = (e) => {
    if (e.key === 'Escape') {
      props.onClose();
    }
  };

  // Hide the currently showing modal on ESC keypress
  // This will be an effect (with cleanup).
  // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects for details
  useEffect(() => {
    console.log('useEffect called!!!');
    window.document.addEventListener('keydown', handleESC);
    return () => {
      console.log('useEffect: removing listener');
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
        'pin',
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
          'sm:w-auto',
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
            'pin-r',
            'pin-t',
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
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Modal;
