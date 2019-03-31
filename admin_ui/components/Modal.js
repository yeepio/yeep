import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Modal(props) {
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
          props.className,
          'w-full',
          'h-full',
          'sm:w-4/5',
          'sm:h-auto',
          'max-w-lg',
          'relative',
          'bg-white',
          'p-4',
          'sm:p-8'
        )}
      >
        <button
          onClick={props.onClose}
          className={classNames(
            'absolute',
            'w-4',
            'h-4',
            'pin-r',
            'pin-t',
            'bg-pink',
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
