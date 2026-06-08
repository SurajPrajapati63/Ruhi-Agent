import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg text-slate-100">{title}</h2>
          <button className="text-slate-300" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body text-slate-200">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
