import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Database, Plus, Edit2, Copy, Trash2, Check } from 'lucide-react';

export default function ProfilesModal({ isOpen, onClose }) {
  const { 
    profiles, 
    activeProfileId, 
    createNewProfile, 
    cloneActiveProfile, 
    renameProfile, 
    deleteProfile, 
    loadProfile,
    showToast
  } = useApp();

  const [newProfileName, setNewProfileName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e) => {
    e.preventDefault();
    const name = newProfileName.trim();
    if (!name) {
      showToast('Please enter a name for the new result sheet.', 'warning');
      return;
    }
    createNewProfile(name);
    setNewProfileName('');
  };

  const handleStartEdit = (p) => {
    setEditingProfileId(p.id);
    setEditingName(p.name);
  };

  const handleSaveRename = (id) => {
    if (!editingName.trim()) {
      showToast('Name cannot be empty.', 'warning');
      return;
    }
    renameProfile(id, editingName);
    setEditingProfileId(null);
  };

  const handleClone = (profile) => {
    const newName = prompt(`Enter name for cloned copy of "${profile.name}":`, `${profile.name} (Copy)`);
    if (newName !== null) {
      // Temporarily load this profile first so we can clone it
      loadProfile(profile.id);
      setTimeout(() => {
        cloneActiveProfile(newName);
      }, 50);
    }
  };

  const handleDelete = (profile) => {
    if (profiles.length <= 1) {
      showToast('Cannot delete the last remaining sheet profile.', 'warning');
      return;
    }
    const confirmDelete = window.confirm(`Are you sure you want to delete "${profile.name}"? All student grades in this sheet will be permanently lost.`);
    if (confirmDelete) {
      deleteProfile(profile.id);
    }
  };

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database style={{ color: 'var(--accent-primary)' }} />
            <h3>Roster Sheets Profile</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage multiple academic class grading sheets. You can create different result sheets for different terms, sections, or classes.
          </p>

          {/* New Sheet Creation Form */}
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ flex: 1 }}
              placeholder="E.g., Grade 9-B Final Exam" 
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ padding: '10px 14px' }}>
              <Plus style={{ width: '16px', height: '16px' }} />
              Create Sheet
            </button>
          </form>

          {/* Profiles Roster List */}
          <div className="profile-list">
            {profiles.map(p => {
              const isActive = p.id === activeProfileId;
              const studentCount = p.students ? p.students.length : 0;
              const subjectCount = p.subjects ? p.subjects.length : 0;

              return (
                <div className={`profile-item ${isActive ? 'active' : ''}`} key={p.id} onClick={() => !isActive && loadProfile(p.id)}>
                  <div className="profile-meta">
                    {editingProfileId === p.id ? (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                          value={editingName} 
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                        <button className="icon-btn" onClick={() => handleSaveRename(p.id)}>
                          <Check style={{ width: '16px', height: '16px', color: 'var(--success)' }} />
                        </button>
                      </div>
                    ) : (
                      <div className="profile-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.name}
                        {isActive && <span className="grade-badge a-plus" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>Active</span>}
                      </div>
                    )}
                    <div className="profile-details">
                      {studentCount} Students • {subjectCount} Subjects
                    </div>
                  </div>

                  <div className="profile-actions" onClick={(e) => e.stopPropagation()}>
                    {editingProfileId !== p.id && (
                      <button className="icon-btn" title="Rename" onClick={() => handleStartEdit(p)}>
                        <Edit2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    )}
                    <button className="icon-btn" title="Clone Sheet" onClick={() => handleClone(p)}>
                      <Copy style={{ width: '14px', height: '14px' }} />
                    </button>
                    <button className="icon-btn delete" title="Delete Sheet" onClick={() => handleDelete(p)}>
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
