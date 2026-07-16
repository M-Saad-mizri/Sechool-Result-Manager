import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2 } from 'lucide-react';

export default function ManageSubjectsModal({ isOpen, onClose, onDeleteSubject }) {
  const { subjects, updateSubject } = useApp();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3>Manage Subjects & Max Marks</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {subjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              No subjects configured yet.
            </div>
          ) : (
            subjects.map((sub, idx) => (
              <div className="manager-subject-item" key={idx}>
                <input 
                  type="text" 
                  className="form-control" 
                  value={sub.name} 
                  onChange={(e) => updateSubject(idx, e.target.value, sub.maxMarks)}
                  placeholder="Subject Name" 
                />
                <input 
                  type="number" 
                  className="form-control" 
                  value={sub.maxMarks} 
                  min="1"
                  onChange={(e) => updateSubject(idx, sub.name, e.target.value)}
                  placeholder="Max Marks" 
                />
                <button className="icon-btn" onClick={() => onDeleteSubject(idx, sub.name)} title="Delete Subject">
                  <Trash2 style={{ width: '18px', height: '18px', color: 'var(--danger)' }} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
