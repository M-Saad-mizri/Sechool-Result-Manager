import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UploadCloud, DownloadCloud, Copy, Download, Share2, Upload, File as FileIcon } from 'lucide-react';

// Resilient fetch helper that tries direct download first, then falls back to different CORS proxies
const fetchBackupData = async (url) => {
  // 1. Try direct fetch
  try {
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Direct fetch failed, trying CORS proxy (corsproxy.io)...", e);
  }

  // 2. Try corsproxy.io (Cloudflare based, fast, high availability)
  try {
    const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("corsproxy.io failed, trying AllOrigins...", e);
  }

  // 3. Try allorigins.win
  const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(allOriginsUrl);
  if (res.ok) return await res.json();

  throw new Error("All fetch attempts failed");
};

export default function ImportExportModal({ isOpen, onClose }) {
  const { students, subjects, config, activeProfile, importData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('export');
  const [exportString, setExportString] = useState('');
  const [importString, setImportString] = useState('');

  useEffect(() => {
    if (isOpen) {
      const dataStr = JSON.stringify({
        name: activeProfile?.name || 'Result Sheet',
        studentsCount: students.length,
        createdAt: activeProfile?.createdAt || new Date().toISOString().split('T')[0],
        students,
        subjects,
        config
      });
      setExportString(dataStr);
      setImportString('');
    }
  }, [isOpen, students, subjects, config, activeProfile]);

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
    
    const sheetNameClean = (activeProfile?.name || 'Result Sheet')
      .trim()
      .replace(/[\s\W]+/g, '_');
    
    const numStudents = students.length;
    const creationDate = activeProfile?.createdAt || new Date().toISOString().split('T')[0];
    const filename = `${sheetNameClean}_${numStudents}_students_${creationDate}.json`;

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

  const shareData = async () => {
    if (!navigator.share) {
      showToast('Sharing requires an HTTPS secure connection. Use Save File/Copy Text locally.', 'warning');
      alert('ℹ️ Browser Security Policy:\n\nWeb sharing (WhatsApp, Gmail, Quick Share, etc.) requires a secure HTTPS connection to work on mobile devices.\n\nOnce you deploy this site to GitHub Pages (which uses HTTPS), this button will work perfectly on your phone!\n\nFor local testing, please use the "Save File" or "Copy Text" buttons to download and send the backup manually.');
      return;
    }

    try {
      const sheetNameClean = (activeProfile?.name || 'Result Sheet')
        .trim()
        .replace(/[\s\W]+/g, '_');
      const numStudents = students.length;
      const creationDate = activeProfile?.createdAt || new Date().toISOString().split('T')[0];
      
      // Use .txt extension and text/plain MIME type so browser permits file sharing
      const filename = `${sheetNameClean}_${numStudents}_students_${creationDate}.txt`;
      const backupFile = new window.File([exportString], filename, { type: 'text/plain' });
      
      let sharePayload = null;
      const canShareFiles = navigator.canShare && navigator.canShare({ files: [backupFile] });

      if (canShareFiles) {
        sharePayload = {
          files: [backupFile],
          title: `${activeProfile?.name || 'Result Sheet'} Backup`,
          text: `Result Sheet Backup for ${activeProfile?.name || 'Result Sheet'}`
        };
      } else {
        sharePayload = {
          title: `${activeProfile?.name || 'Result Sheet'} Backup`,
          text: `Result Sheet: ${activeProfile?.name || 'Result Sheet'}\nStudents: ${numStudents}\nDate: ${creationDate}\n\n(Please use Save File or Copy Text to transfer)`
        };
      }

      console.log("Sharing payload:", sharePayload);
      await navigator.share(sharePayload);
      showToast('Backup shared successfully!');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Web Share failed:", err);
        showToast('Failed to share backup.', 'danger');
      }
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
      
      let fetchUrl = cleanInput;
      // Auto-convert standard web page links to direct download links
      if (fetchUrl.includes("tmpfiles.org") && !fetchUrl.includes("/dl/")) {
        fetchUrl = fetchUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
      }

      try {
        parsedData = await fetchBackupData(fetchUrl);
      } catch (e) {
        console.error(e);
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
                 <button className="btn btn-primary" onClick={shareData} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Share2 style={{ width: '16px', height: '16px' }} />
                  Share Backup via Apps
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
                    <FileIcon style={{ width: '16px', height: '16px' }} />
                    Choose File
                    <input 
                      type="file" 
                      accept=".json,.txt" 
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
