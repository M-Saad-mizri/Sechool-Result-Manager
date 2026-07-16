import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Info, X } from 'lucide-react';

export default function ReminderModal({ isOpen, onClose }) {
  const { dismissReminder } = useApp();
  const [dontShow, setDontShow] = useState(false);

  if (!isOpen) return null;

  const handleDismiss = () => {
    dismissReminder(dontShow);
    onClose();
  };

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info style={{ color: 'var(--warning)' }} />
            <h3>Important Reminder</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <strong>Auto-Save is Enabled:</strong> Every change you make to student details or marks is automatically saved in your browser's local memory.
            </li>
            <li>
              <strong>Compile & Rank:</strong> Remember to click the <strong>"Compile & Rank"</strong> button to calculate final standings, update performance analytics, and sort the class report in descending order.
            </li>
            <li>
              <strong>Export & Backup:</strong> You can export/share your datasets via the <strong>Share / Backup</strong> button to prevent losing data when clearing your browser cache.
            </li>
          </ol>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              style={{ width: '16px', height: '16px' }} 
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
            />
            Don't show this again
          </label>
          <button className="btn btn-primary" onClick={handleDismiss}>O.K.</button>
        </div>
      </div>
    </div>
  );
}
