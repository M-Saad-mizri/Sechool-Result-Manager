import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GraduationCap, Table, BarChart3, Settings, HelpCircle, Database, Plus, X, FileText, CreditCard, Share2 } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onManageProfiles, onExportPdf, onExportCards, onShareBackup }) {
  const { 
    activeTab, 
    setActiveTab, 
    activeProfile, 
    activeProfileId,
    profiles, 
    loadProfile, 
    createNewProfile,
    showToast 
  } = useApp();

  const [showProfileSelector, setShowProfileSelector] = useState(false);

  const handleMenuClick = (tab) => {
    setActiveTab(tab);
    if (onClose) onClose(); // Close on mobile
  };

  const handleProfileSelect = (id) => {
    loadProfile(id);
    setShowProfileSelector(false);
    if (onClose) onClose();
  };

  const handleAddNewProfile = () => {
    const name = prompt("Enter a name for the new result sheet:");
    if (name && name.trim()) {
      createNewProfile(name);
      if (onClose) onClose();
    }
  };

  const menuItems = [
    { id: 'sheet', label: 'Grade Sheets', icon: Table },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Configurations', icon: Settings },
    { id: 'faq', label: 'Help Center', icon: HelpCircle },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Mobile close button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }} className="mobile-close-container">
        <button 
          className="icon-btn mobile-only" 
          onClick={onClose}
          style={{ display: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px' }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <GraduationCap style={{ width: '22px', height: '22px' }} />
        </div>
        <div>
          <h1>Result Compiler</h1>
          <p>Studio v2.0</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <Icon style={{ width: '18px', height: '18px' }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Action Buttons */}
      <div className="sidebar-actions-menu" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <span className="sidebar-section-title">Export & Share</span>
        <button className="menu-item" onClick={() => { onExportPdf(); if (onClose) onClose(); }}>
          <FileText style={{ width: '18px', height: '18px' }} />
          Export PDF
        </button>
        <button className="menu-item" onClick={() => { onExportCards(); if (onClose) onClose(); }}>
          <CreditCard style={{ width: '18px', height: '18px' }} />
          Result Cards
        </button>
        <button className="menu-item" onClick={() => { onShareBackup(); if (onClose) onClose(); }}>
          <Share2 style={{ width: '18px', height: '18px' }} />
          Share / Backup
        </button>
      </div>

      {/* Roster profiles collapsible section */}
      <div className="sidebar-profiles">
        {showProfileSelector && (
          <div className="sidebar-profiles-list" style={{ marginBottom: '8px' }}>
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => handleProfileSelect(p.id)}
                className={`sidebar-profile-item ${p.id === activeProfileId ? 'active' : ''}`}
              >
                <span>{p.name}</span>
                {p.id === activeProfileId && <span className="profile-active-dot" />}
              </button>
            ))}
            <div className="sidebar-divider" />
            <button className="sidebar-profile-action" onClick={handleAddNewProfile}>
              <Plus style={{ width: '14px', height: '14px' }} />
              <span>New Sheet...</span>
            </button>
            <button className="sidebar-profile-action" onClick={() => { setShowProfileSelector(false); onManageProfiles(); }}>
              <span>Manage Rosters...</span>
            </button>
          </div>
        )}

        <button 
          className="profile-select-btn"
          onClick={() => setShowProfileSelector(!showProfileSelector)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <Database style={{ width: '16px', height: '16px', color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700 }}>Roster Profiles</span>
          </div>
          <span style={{ fontSize: '0.65rem', marginLeft: '6px', transform: showProfileSelector ? 'rotate(180deg)' : '', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
        </button>
      </div>
    </aside>
  );
}
