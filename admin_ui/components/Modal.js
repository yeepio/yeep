import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

function Modal(props) {
  // Use a portal for the modal
  // to attach it as a child of <div id="root">
  return ReactDOM.createPortal(
    <div className="modalOverlay">
      <style jsx>{`
        .modalOverlay {
        left:0;
        top:0;
        right:0;
        bottom:0;
          position:absolute;
          width:100%;
          height:100%;
          background:rgba(0,0,0,0.3);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .modal {
        position:relative;
          background-color:white;
          padding:2rem;
          box-shadow:0px 10px 20px 0px rgba(0,0,0,0.5);
        }
        .modalClose {
          position:absolute;
          right:10px;
          top:10px;
          width:16px;
          height:16px;
          float:right;
          background:pink;
        }
      `}</style>
      <div className="modal">
        <button onClick={props.onClose} className="modalClose" />
        {props.children}
      </div>
    </div>,
    document.getElementById('root')
  );
}

Modal.propTypes = {
  // Parent component needs to send an onClose handler
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export default Modal;
