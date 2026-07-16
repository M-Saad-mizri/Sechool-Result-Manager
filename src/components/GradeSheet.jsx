import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Table, Inbox, Trash2, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

// Get user initials for avatar display
const getInitials = (name) => {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function GradeSheet({ onDeleteStudent }) {
  const { 
    sortedStudents, 
    subjects, 
    updateStudentField, 
    updateStudentMark,
    sortBy,
    sortOrder,
    handleSortChange
  } = useApp();

  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleAccordion = (id) => {
    setExpandedStudentId(prev => (prev === id ? null : id));
  };

  // Sort indicator icon renderer
  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown style={{ width: '12px', height: '12px', opacity: 0.3 }} />;
    }
    return sortOrder === 'asc' 
      ? <ChevronUp style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />
      : <ChevronDown style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />;
  };

  return (
    <div className="premium-card">
      <div className="premium-card-header">
        <h3 className="premium-card-title">
          <Table style={{ color: 'var(--accent-primary)', width: '20px', height: '20px' }} />
          <span>Student Grade Sheet Editor</span>
        </h3>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
          {subjects.length} Subject(s) Configured
        </div>
      </div>

      {/* Desktop Spreadsheet-style Grid Table */}
      <div className="spreadsheet-container table-responsive">
        <table className="spreadsheet-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }} onClick={() => handleSortChange('rank')}>
                <div className="th-content">
                  Rank {renderSortIndicator('rank')}
                </div>
              </th>
              <th style={{ width: '220px' }} onClick={() => handleSortChange('name')}>
                <div className="th-content">
                  Student Name {renderSortIndicator('name')}
                </div>
              </th>
              <th style={{ width: '220px' }}>
                <div className="th-content">Father's Name</div>
              </th>
              
              {subjects.map((sub, index) => (
                <th key={index} style={{ textAlign: 'center' }}>
                  <div className="th-content" style={{ flexDirection: 'column', gap: '2px' }}>
                    <span>{sub.name}</span>
                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'lowercase' }}>
                      max: {sub.maxMarks}
                    </span>
                  </div>
                </th>
              ))}
              
              <th onClick={() => handleSortChange('percentage')}>
                <div className="th-content">
                  Obt. Marks {renderSortIndicator('percentage')}
                </div>
              </th>
              <th onClick={() => handleSortChange('percentage')}>
                <div className="th-content">
                  Percentage {renderSortIndicator('percentage')}
                </div>
              </th>
              <th>Grade</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={subjects.length + 7} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <Inbox style={{ margin: '0 auto 12px', display: 'block', width: '40px', height: '40px', opacity: 0.4 }} />
                  No student records match the filters. Add students or clear search query.
                </td>
              </tr>
            ) : (
              sortedStudents.map((student, index) => (
                <tr key={student.id}>
                  {/* Rank Standings */}
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>#{index + 1}</span>
                  </td>
                  
                  {/* Student Name */}
                  <td>
                    <input 
                      type="text" 
                      className="spreadsheet-input" 
                      value={student.name}
                      placeholder="Enter Student Name"
                      onChange={(e) => updateStudentField(student.id, 'name', e.target.value)}
                    />
                  </td>

                  {/* Father's Name */}
                  <td>
                    <input 
                      type="text" 
                      className="spreadsheet-input" 
                      value={student.fatherName}
                      placeholder="Father's Name"
                      onChange={(e) => updateStudentField(student.id, 'fatherName', e.target.value)}
                    />
                  </td>

                  {/* Subject Marks Inputs */}
                  {subjects.map((sub, subIdx) => {
                    const currentVal = student.marks[sub.name] !== undefined ? student.marks[sub.name] : "";
                    const isInvalid = parseFloat(currentVal) > sub.maxMarks || parseFloat(currentVal) < 0;
                    return (
                      <td key={subIdx} style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          className={`spreadsheet-input ${isInvalid ? 'invalid' : ''}`}
                          style={{ textAlign: 'center', maxWidth: '90px', margin: '0 auto' }}
                          min="0"
                          max={sub.maxMarks}
                          placeholder={`0-${sub.maxMarks}`}
                          value={currentVal}
                          title={isInvalid ? `Marks cannot exceed maximum of ${sub.maxMarks}` : ''}
                          onChange={(e) => updateStudentMark(student.id, sub.name, e.target.value)}
                        />
                      </td>
                    );
                  })}

                  {/* Obtained Marks */}
                  <td style={{ fontWeight: 800, textAlign: 'center' }}>{student.totalMarks}</td>

                  {/* Percentage */}
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>
                    {student.percentage ? `${student.percentage.toFixed(2)}%` : '0.00%'}
                  </td>

                  {/* Grade Badge */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`grade-badge ${student.grade.replace("+", "-plus").toLowerCase()}`}>
                      {student.grade}
                    </span>
                  </td>

                  {/* Delete Button */}
                  <td style={{ textAlign: 'center' }}>
                    <button className="icon-btn" title="Delete Student" onClick={() => onDeleteStudent(student)}>
                      <Trash2 style={{ width: '18px', height: '18px' }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive Touch-friendly Cards (Mobile View) */}
      <div className="mobile-card-list">
        {sortedStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontWeight: 600, border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
            <Inbox style={{ margin: '0 auto 12px', display: 'block', width: '36px', height: '36px', opacity: 0.4 }} />
            No student records found.
          </div>
        ) : (
          sortedStudents.map((student, index) => {
            const isExpanded = expandedStudentId === student.id;
            return (
              <div className="mobile-student-card" key={student.id}>
                {/* Header Row with Avatars */}
                <div className="mobile-avatar-row">
                  <div className="avatar-badge-group">
                    <div className="avatar-initials">
                      {getInitials(student.name)}
                    </div>
                    <div className="avatar-meta">
                      <h3>{student.name || "Unnamed Student"}</h3>
                      <p>Father: {student.fatherName || "N/A"}</p>
                    </div>
                  </div>
                  <span className={`grade-badge ${student.grade.replace("+", "-plus").toLowerCase()}`}>
                    {student.grade}
                  </span>
                </div>

                {/* Score Summary Metrics */}
                <div className="mobile-metrics-row">
                  <div className="metric-item">
                    <span className="metric-label">Rank</span>
                    <span className="metric-value">#{index + 1}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Score</span>
                    <span className="metric-value">{student.totalMarks}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Percent</span>
                    <span className="metric-value">
                      {student.percentage ? `${student.percentage.toFixed(1)}%` : '0.0%'}
                    </span>
                  </div>
                </div>

                {/* Accordion Expand Toggler */}
                <button className="accordion-trigger" onClick={() => toggleAccordion(student.id)}>
                  <span>Edit Marks & Details</span>
                  <ChevronDown 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </button>

                {/* Expanded Input fields */}
                <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
                  <div className="card-input-group">
                    <label>Student Name</label>
                    <input 
                      type="text" 
                      value={student.name} 
                      onChange={(e) => updateStudentField(student.id, 'name', e.target.value)} 
                      placeholder="Name" 
                    />
                  </div>
                  <div className="card-input-group">
                    <label>Father's Name</label>
                    <input 
                      type="text" 
                      value={student.fatherName} 
                      onChange={(e) => updateStudentField(student.id, 'fatherName', e.target.value)} 
                      placeholder="Father's Name" 
                    />
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Subject Marks
                    </h4>
                    {subjects.map((sub, idx) => {
                      const markVal = student.marks[sub.name] !== undefined ? student.marks[sub.name] : "";
                      const isInvalid = parseFloat(markVal) > sub.maxMarks || parseFloat(markVal) < 0;
                      return (
                        <div className="card-input-group" key={idx}>
                          <label>{sub.name} (Max {sub.maxMarks})</label>
                          <input 
                            type="number" 
                            value={markVal} 
                            style={isInvalid ? { borderColor: 'var(--danger)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' } : {}}
                            min="0" 
                            max={sub.maxMarks} 
                            placeholder={`0-${sub.maxMarks}`} 
                            onChange={(e) => updateStudentMark(student.id, sub.name, e.target.value)} 
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    className="btn btn-danger" 
                    onClick={() => onDeleteStudent(student)} 
                    style={{ marginTop: '12px', padding: '10px', width: '100%', borderRadius: '10px' }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline' }} />
                    Remove Student
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
