import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose }) {
  const { addStudents } = useApp();
  const [names, setNames] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!names.trim()) return;
    addStudents(names);
    setNames('');
    onClose();
  };

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Add New Student(s)</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="student-names-input">Student Name(s)</label>
            <textarea 
              className="form-control" 
              id="student-names-input" 
              rows="4" 
              placeholder="Enter student names (separated by commas or new lines)"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              autoFocus
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              E.g. Ali Ahmed, John Smith, Sana Fatima
            </span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Students</button>
        </div>
      </div>
    </div>
  );
}
