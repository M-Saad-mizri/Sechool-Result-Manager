import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, DownloadCloud, Copy, Download, Link, Upload, File } from 'lucide-react';

export default function ImportExportModal({ isOpen, onClose }) {
  const { students, subjects, importData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('export');
  const [exportString, setExportString] = useState('');
  const [importString, setImportString] = useState('');

  useEffect(() => {
    if (isOpen) {
      const dataStr = JSON.stringify({ students, subjects });
      setExportString(dataStr);
      setImportString('');
    }
  }, [isOpen, students, subjects]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportString).then(() => {
      showToast('Text string copied to clipboard!');
    }).catch(() => {
      showToast('Failed to copy text code.', 'danger');
    });
  };

  const downloadBackup = () => {
    const blob = new Blob([exportString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").split('T')[0];
    const filename = `result_backup_${timestamp}.json`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    showToast('Backup JSON file saved to downloads!');
  };

  const uploadCloud = async () => {
    showToast('Uploading database, please wait...', 'warning');
    try {
      const blob = new Blob([exportString], { type: 'application/json' });
      const formData = new FormData();
      formData.append("file", blob, "results.json");

      const response = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.data && result.data.url) {
        const shareLink = result.data.url.replace("/v1/", "/");
        await navigator.clipboard.writeText(shareLink);
        showToast('Share link created and copied to clipboard!');
        alert(`✅ Share link created successfully!\n\nCopied to clipboard:\n${shareLink}\n\n(Expires in 7 days)`);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to upload. Try copy text or download file.', 'danger');
    }
  };

  const handleImportSubmit = async () => {
    const cleanInput = importString.trim();
    if (!cleanInput) {
      showToast('Please paste JSON or URL link.', 'warning');
      return;
    }

    let parsedData = null;

    if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) {
      showToast('Fetching database from link...', 'warning');
      try {
        const response = await fetch(cleanInput);
        if (!response.ok) throw new Error("HTTP error");
        parsedData = await response.json();
      } catch (e) {
        showToast('Failed to fetch data from link.', 'danger');
        return;
      }
    } else {
      try {
        parsedData = JSON.parse(cleanInput);
      } catch (e) {
        showToast('Invalid JSON text format.', 'danger');
        return;
      }
    }

    importData(parsedData);
    onClose();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        importData(parsed);
        onClose();
      } catch (err) {
        showToast('Failed to parse file. Make sure it is a valid backup.', 'danger');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop visible">
      <div className="modal-box" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h3>Share & Backup Data</h3>
          <button className="modal-close" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '16px 24px' }}>
          <div className="tab-container">
            <button 
              className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
              onClick={() => setActiveTab('export')}
            >
              <UploadCloud style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
              Export Backup
            </button>
            <button 
              className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              <DownloadCloud style={{ width: '14px', height: '14px', marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
              Import Backup
            </button>
          </div>

          {activeTab === 'export' ? (
            <div className="tab-content active">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Copy the raw database string or download a local backup file. You can also generate a temporary share link.
              </p>
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  rows="5" 
                  readOnly 
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: 'var(--bg-primary)' }}
                  value={exportString}
                  onClick={(e) => e.target.select()}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="btn btn-secondary" onClick={copyToClipboard}>
                    <Copy style={{ width: '16px', height: '16px' }} />
                    Copy Text
                  </button>
                  <button className="btn btn-secondary" onClick={downloadBackup}>
                    <Download style={{ width: '16px', height: '16px' }} />
                    Save File (.json)
                  </button>
                </div>
                <button className="btn btn-primary" onClick={uploadCloud}>
                  <Link style={{ width: '16px', height: '16px' }} />
                  Create Cloud Link (tmpfiles.org)
                </button>
              </div>
            </div>
          ) : (
            <div className="tab-content active">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Paste a backup text string, select a `.json` backup file from your device, or paste a cloud JSON sharing link.
              </p>
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="Paste JSON database content or link here..."
                  value={importString}
                  onChange={(e) => setImportString(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleImportSubmit}>
                    <Upload style={{ width: '16px', height: '16px' }} />
                    Import Data
                  </button>
                  <button className="btn btn-secondary" style={{ position: 'relative' }}>
                    <File style={{ width: '16px', height: '16px' }} />
                    Choose File
                    <input 
                      type="file" 
                      accept=".json" 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      onChange={handleFileImport}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
