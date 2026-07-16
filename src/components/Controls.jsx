import React from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, PlusCircle, Settings, Calculator, Trash2 } from 'lucide-react';

export default function Controls({
  onAddStudent,
  onAddSubject,
  onManageSubjects,
  onReset
}) {
  const { compileAndRank } = useApp();

  return (
    <div className="control-panel">
      <div className="btn-group">
        <button className="btn btn-primary" onClick={onAddStudent}>
          <UserPlus style={{ width: '18px', height: '18px' }} />
          Add Student
        </button>
        <button className="btn btn-primary" onClick={onAddSubject}>
          <PlusCircle style={{ width: '18px', height: '18px' }} />
          Add Subject
        </button>
        <button className="btn btn-secondary" onClick={onManageSubjects}>
          <Settings style={{ width: '18px', height: '18px' }} />
          Manage Subjects
        </button>
      </div>

      <div className="btn-group">
        <button className="btn btn-success" onClick={compileAndRank}>
          <Calculator style={{ width: '18px', height: '18px' }} />
          Compile & Rank
        </button>
        <button className="btn btn-danger" onClick={onReset}>
          <Trash2 style={{ width: '18px', height: '18px' }} />
          Reset
        </button>
      </div>
    </div>
  );
}
