import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, Trash2 } from 'lucide-react';

export default function PdfSettingsModal({ isOpen, onClose, type, onSubmit }) {
  const { config } = useApp();
  const { branding } = config;

  const [heading, setHeading] = useState('Result Report');
  const [schoolName, setSchoolName] = useState('Beaconhouse School System');
  const [className, setClassName] = useState('Grade 8-A');
  const [termExam, setTermExam] = useState('First Term Exam');
  const [templateStyle, setTemplateStyle] = useState('classic_navy');
  const [customDate, setCustomDate] = useState('');
  
  const [teacherSig, setTeacherSig] = useState(null);
  const [principalSig, setPrincipalSig] = useState(null);

  // Sync inputs with saved configuration when opening modal
  useEffect(() => {
    if (isOpen && branding) {
      setSchoolName(branding.schoolName || 'Beaconhouse School System');
      setClassName(branding.className || 'Grade 8-A');
      setTermExam(branding.termExam || 'First Term Exam');
      setTemplateStyle(branding.templateStyle || 'classic_navy');
      setCustomDate(branding.customDate || '');
      setHeading(branding.className ? `${branding.className} Result Report` : 'Result Report');
      
      // Default to empty uploads, but fallback to saved branding sigs during download if not specified
      setTeacherSig(null);
      setPrincipalSig(null);
    }
  }, [isOpen, branding]);

  if (!isOpen) return null;

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setter(evt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setter(null);
    }
  };

  const handleGenerate = () => {
    onSubmit({
      heading,
      schoolName,
      className,
      termExam,
      teacherSig,
      principalSig,
      templateStyle,
      customDate
    });
    onClose();
  };

  const isReport = type === 'report';

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box">
        <div className="modal-header">
          <h3>{isReport ? 'Export PDF Report Sheet' : 'Generate Student Result Cards'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body">
          {isReport ? (
            <div className="form-group">
              <label htmlFor="pdf-heading-input">Report Heading</label>
              <input 
                type="text" 
                className="form-control" 
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>School Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div className="pdf-modal-grid">
                <div className="form-group">
                  <label>Class / Grade</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Term Exam</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={termExam}
                    onChange={(e) => setTermExam(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Card Template Style / Theme</label>
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
            </>
          )}

          <div className="form-group" style={{ marginTop: '12px', marginBottom: '12px' }}>
            <label>Custom Date (Optional - defaults to today)</label>
            <input 
              type="text" 
              className="form-control" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              placeholder="E.g., March 15, 2026"
            />
          </div>

          <div className="pdf-modal-grid" style={{ marginTop: '6px' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                Teacher Signature (One-off Override)
              </label>
              {teacherSig ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px 12px', background: 'var(--bg-primary)' }}>
                  <img src={teacherSig} alt="Teacher Signature" style={{ height: '24px', objectFit: 'contain', maxWidth: '100px' }} />
                  <button className="icon-btn" onClick={() => setTeacherSig(null)} title="Clear Override" style={{ padding: '4px' }}>
                    <Trash2 style={{ width: '14px', height: '14px', color: 'var(--danger)' }} />
                  </button>
                </div>
              ) : (
                <div className="form-control" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', gap: '8px', padding: '12px', cursor: 'pointer', height: '42px', overflow: 'hidden' }}>
                  <Upload style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {branding.teacherSig ? 'Override Signature' : 'Upload Image'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                    onChange={(e) => handleFileChange(e, setTeacherSig)}
                  />
                </div>
              )}
              {branding.teacherSig && !teacherSig && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>
                    ✓ Using saved default:
                  </span>
                  <img 
                    src={branding.teacherSig} 
                    alt="Saved Default Teacher Sig" 
                    style={{ height: '18px', objectFit: 'contain', maxWidth: '60px', opacity: 0.7, border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px', backgroundColor: '#fff' }} 
                  />
                </div>
              )}
            </div>

            {!isReport && (
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                  Principal Signature (One-off Override)
                </label>
                {principalSig ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '8px 12px', background: 'var(--bg-primary)' }}>
                    <img src={principalSig} alt="Principal Signature" style={{ height: '24px', objectFit: 'contain', maxWidth: '100px' }} />
                    <button className="icon-btn" onClick={() => setPrincipalSig(null)} title="Clear Override" style={{ padding: '4px' }}>
                      <Trash2 style={{ width: '14px', height: '14px', color: 'var(--danger)' }} />
                    </button>
                  </div>
                ) : (
                  <div className="form-control" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', gap: '8px', padding: '12px', cursor: 'pointer', height: '42px', overflow: 'hidden' }}>
                    <Upload style={{ width: '14px', height: '14px', color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      {branding.principalSig ? 'Override Signature' : 'Upload Image'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
                      onChange={(e) => handleFileChange(e, setPrincipalSig)}
                    />
                  </div>
                )}
                {branding.principalSig && !principalSig && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>
                      ✓ Using saved default:
                    </span>
                    <img 
                      src={branding.principalSig} 
                      alt="Saved Default Principal Sig" 
                      style={{ height: '18px', objectFit: 'contain', maxWidth: '60px', opacity: 0.7, border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px', backgroundColor: '#fff' }} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleGenerate}>Generate & Download</button>
        </div>
      </div>
    </div>
  );
}
