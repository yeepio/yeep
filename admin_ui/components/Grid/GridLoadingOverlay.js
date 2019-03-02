import React from 'react';

const GridLoadingOverlay = () => {
  return (
    <div className="gridOverlay absolute w-full h-full flex justify-center items-center text-grey-dark italic">
      <div className="gridOverlayLoader"/>
      <style jsx>{`
        .gridOverlay {
          background-color: rgba(255, 255, 255, 0.8);
          // To ensure we're above any Select component
          z-index: 2;
        }
        .gridOverlayLoader,
        .gridOverlayLoader:after {
          border-radius: 50%;
          width: 88px;
          height: 88px;
        }
        .gridOverlayLoader {
          font-size: 10px;
          position: relative;
          text-indent: -9999em;
          border-top: 1.1em solid rgba(0, 0, 0, 0.1);
          border-right: 1.1em solid rgba(0, 0, 0, 0.1);
          border-bottom: 1.1em solid rgba(0, 0, 0, 0.1);
          border-left: 1.1em solid #ffffff;
          transform: translateZ(0);
          animation: load8 1.1s infinite linear;
        }
        @keyframes load8 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default GridLoadingOverlay;
