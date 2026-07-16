import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, Search, CloudCheck, CloudLightning, Sun, Moon, Database } from 'lucide-react';

export default function Header({ onToggleMobileSidebar, onOpenProfiles }) {
  const { 
    theme, 
    toggleTheme, 
    unsavedChanges, 
    activeProfile,
    activeTab,
    searchQuery,
    setSearchQuery
  } = useApp();

  return (
    <header>
      {/* Mobile Top Header Toggler */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="hamburger-btn mobile-only" 
          onClick={onToggleMobileSidebar}
          title="Open Menu"
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            display: 'none' // Controlled by CSS media query display rules
          }}
        >
          <Menu style={{ width: '20px', height: '20px' }} />
        </button>
        
        {/* Search bar inside header (only visible during grading sheets editor) */}
        {activeTab === 'sheet' && (
          <div className="header-search-wrapper">
            <Search className="header-search-icon" style={{ width: '18px', height: '18px' }} />
            <input 
              type="text" 
              className="header-search-input" 
              placeholder="Search student or father name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="header-right">
        {activeProfile && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 14px', fontSize: '0.85rem' }} 
            onClick={onOpenProfiles}
            title="Switch or Manage Result Sheets"
          >
            <Database style={{ width: '16px', height: '16px', color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700 }}>{activeProfile.name}</span>
          </button>
        )}

        <div className={`sync-status ${unsavedChanges ? 'unsaved' : ''}`}>
          <span className="sync-icon-container">
            {unsavedChanges ? (
              <CloudLightning style={{ width: "16px", height: "16px" }} />
            ) : (
              <CloudCheck style={{ width: "16px", height: "16px" }} />
            )}
          </span>
          <span className="sync-text">{unsavedChanges ? 'Unsaved Changes' : 'Auto-Saved'}</span>
        </div>

        <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
          {theme === 'dark' ? (
            <Sun style={{ width: '20px', height: '20px' }} />
          ) : (
            <Moon style={{ width: '20px', height: '20px' }} />
          )}
        </button>
      </div>
    </header>
  );
}
