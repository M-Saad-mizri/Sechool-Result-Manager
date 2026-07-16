import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle style={{ color: 'var(--danger)' }} />
            <h3>{title || 'Confirm Action'}</h3>
          </div>
          <button className="modal-close" onClick={onCancel}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Execute</button>
        </div>
      </div>
    </div>
  );
}
