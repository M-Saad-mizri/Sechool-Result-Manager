import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Award, Upload, Trash2, Plus, FileSignature, X } from 'lucide-react';

export default function ConfigPanel() {
  const { config, updateProfileConfig, showToast } = useApp();
  const { branding, gradeRules } = config;

  // Local state for branding details
  const [schoolName, setSchoolName] = useState(branding.schoolName || '');
  const [className, setClassName] = useState(branding.className || '');
  const [termExam, setTermExam] = useState(branding.termExam || '');
  const [templateStyle, setTemplateStyle] = useState(branding.templateStyle || 'classic_navy');
  const [customDate, setCustomDate] = useState(branding.customDate || '');

  // Local state to add new remark tags
  const [newRemarkTexts, setNewRemarkTexts] = useState({});

  const handleBrandingSave = (e) => {
    e.preventDefault();
    updateProfileConfig({
      branding: {
        ...branding,
        schoolName,
        className,
        termExam,
        templateStyle,
        customDate
      }
    });
  };

  const handleSignatureUpload = (e, sigKey) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        updateProfileConfig({
          branding: {
            ...branding,
            [sigKey]: evt.target.result
          }
        });
        showToast('Signature uploaded and saved successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearSignature = (sigKey) => {
    updateProfileConfig({
      branding: {
        ...branding,
        [sigKey]: null
      }
    });
    showToast('Signature cleared.');
  };

  // Grade rules edit handlers
  const handleGradeMinChange = (gradeIdx, value) => {
    const numeric = parseFloat(value);
    if (isNaN(numeric) || numeric < 0 || numeric > 100) return;
    
    const updatedRules = [...gradeRules];
    updatedRules[gradeIdx] = {
      ...updatedRules[gradeIdx],
      minPercent: numeric
    };
    
    updateProfileConfig({ gradeRules: updatedRules });
  };

  const handleAddRemark = (gradeIdx, gradeVal) => {
    const text = newRemarkTexts[gradeVal]?.trim();
    if (!text) return;

    const updatedRules = [...gradeRules];
    const rule = updatedRules[gradeIdx];
    const updatedRemarks = [...(rule.remarks || []), text];
    
    updatedRules[gradeIdx] = {
      ...rule,
      remarks: updatedRemarks
    };

    updateProfileConfig({ gradeRules: updatedRules });
    setNewRemarkTexts(prev => ({ ...prev, [gradeVal]: '' }));
  };

  const handleDeleteRemark = (gradeIdx, remarkIdx) => {
    const updatedRules = [...gradeRules];
    const rule = updatedRules[gradeIdx];
    const updatedRemarks = rule.remarks.filter((_, i) => i !== remarkIdx);
    
    updatedRules[gradeIdx] = {
      ...rule,
      remarks: updatedRemarks
    };

    updateProfileConfig({ gradeRules: updatedRules });
  };

  return (
    <div className="config-layout">
      {/* 1. Branding & Signature Setup */}
      <div className="settings-group">
        <div className="premium-card">
          <div className="premium-card-header">
            <h3 className="premium-card-title">
              <Settings style={{ color: 'var(--accent-primary)', width: '18px', height: '18px' }} />
              PDF Roster Branding
            </h3>
          </div>
          <form onSubmit={handleBrandingSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>School / Institution Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="E.g., Beaconhouse School System"
              />
            </div>
            
            <div className="form-group">
              <label>Class / Grade Title</label>
              <input 
                type="text" 
                className="form-control" 
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="E.g., Grade 8-A"
              />
            </div>

            <div className="form-group">
              <label>Term Exam Session</label>
              <input 
                type="text" 
                className="form-control" 
                value={termExam}
                onChange={(e) => setTermExam(e.target.value)}
                placeholder="E.g., First Term Exam"
              />
            </div>
            <div className="form-group">
              <label>Default Card Template Style</label>
              <select 
                className="form-control"
                value={templateStyle}
                onChange={(e) => setTemplateStyle(e.target.value)}
              >
                <option value="classic_navy">Classic Navy</option>
                <option value="modern_emerald">Modern Emerald</option>
                <option value="royal_crimson">Royal Crimson</option>
                <option value="minimalist_slate">Minimalist Slate</option>
                <option value="vintage_sepia">Vintage Sepia</option>
              </select>
            </div>
            <div className="form-group">
              <label>Default Custom Date (Optional)</label>
              <input 
                type="text" 
                className="form-control" 
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                placeholder="E.g., March 15, 2026 (Leave blank for today's date)"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Branding Defaults
            </button>
          </form>
        </div>

        {/* Signature uploads panel */}
        <div className="premium-card">
          <div className="premium-card-header">
            <h3 className="premium-card-title">
              <FileSignature style={{ color: 'var(--accent-primary)', width: '18px', height: '18px' }} />
              Saved Signatures
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Teacher signature */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Teacher Signature (Landscape)
              </label>
              {branding.teacherSig ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px' }}>
                  <img src={branding.teacherSig} alt="Teacher Sig" style={{ height: '36px', objectFit: 'contain', maxWidth: '120px' }} />
                  <button className="icon-btn" onClick={() => handleClearSignature('teacherSig')} title="Remove">
                    <Trash2 style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
                  </button>
                </div>
              ) : (
                <div className="form-control" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', gap: '8px', padding: '16px', cursor: 'pointer' }}>
                  <Upload style={{ width: '16px', height: '16px', color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Choose Signature File</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}
                    onChange={(e) => handleSignatureUpload(e, 'teacherSig')}
                  />
                </div>
              )}
            </div>

            {/* Principal signature */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Principal Signature (Landscape)
              </label>
              {branding.principalSig ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px' }}>
                  <img src={branding.principalSig} alt="Principal Sig" style={{ height: '36px', objectFit: 'contain', maxWidth: '120px' }} />
                  <button className="icon-btn" onClick={() => handleClearSignature('principalSig')} title="Remove">
                    <Trash2 style={{ width: '16px', height: '16px', color: 'var(--danger)' }} />
                  </button>
                </div>
              ) : (
                <div className="form-control" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', gap: '8px', padding: '16px', cursor: 'pointer' }}>
                  <Upload style={{ width: '16px', height: '16px', color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Choose Signature File</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}
                    onChange={(e) => handleSignatureUpload(e, 'principalSig')}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grading Rules Editor */}
      <div className="premium-card">
        <div className="premium-card-header">
          <h3 className="premium-card-title">
            <Award style={{ color: 'var(--accent-primary)', width: '18px', height: '18px' }} />
            Grading Scale & Remarks Configurator
          </h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Configure percentage thresholds and remarks/comments. Results recalculate instantly. One remark is chosen at random per student matching the letter grade on PDF outputs.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {gradeRules.map((rule, idx) => (
              <div className="grade-rule-row" key={idx}>
                {/* Grade Label */}
                <div className="grade-rule-badge">{rule.grade}</div>

                {/* Min Percentage input */}
                <div className="form-group" style={{ gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)' }}>MINIMUM %</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '6px 10px', fontSize: '0.85rem', textAlign: 'center' }}
                    value={rule.minPercent} 
                    min="0"
                    max="100"
                    disabled={rule.grade === "F"} // F is always bottom fallback 0%
                    onChange={(e) => handleGradeMinChange(idx, e.target.value)}
                  />
                </div>

                {/* Remarks configuration list */}
                <div className="remarks-list-input">
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Remarks Pool
                  </span>
                  
                  {/* Active tags list */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0' }}>
                    {rule.remarks && rule.remarks.map((rem, remIdx) => (
                      <span 
                        key={remIdx} 
                        style={{
                          fontSize: '0.75rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '3px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 500
                        }}
                      >
                        {rem.length > 25 ? rem.substring(0, 23) + '...' : rem}
                        <button 
                          type="button"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                          onClick={() => handleDeleteRemark(idx, remIdx)}
                          title="Remove remark"
                        >
                          <X style={{ width: '12px', height: '12px' }} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Tag input */}
                  <div className="remark-tag-input">
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ padding: '4px 10px', fontSize: '0.8rem', flex: 1 }}
                      placeholder="Add custom comment..."
                      value={newRemarkTexts[rule.grade] || ''}
                      onChange={(e) => setNewRemarkTexts(prev => ({ ...prev, [rule.grade]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRemark(idx, rule.grade))}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 10px', minHeight: 'auto' }}
                      onClick={() => handleAddRemark(idx, rule.grade)}
                    >
                      <Plus style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
