import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

export default function AddSubjectModal({ isOpen, onClose }) {
  const { addSubject } = useApp();
  const [name, setName] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const cleanedName = name.trim();
    if (!cleanedName) return;
    addSubject(cleanedName, maxMarks);
    setName('');
    setMaxMarks(100);
    onClose();
  };

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Add New Subject</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Subject Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="E.g. Mathematics, Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Maximum Marks</label>
            <input 
              type="number" 
              className="form-control" 
              min="1"
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Add Subject</button>
        </div>
      </div>
    </div>
  );
}
