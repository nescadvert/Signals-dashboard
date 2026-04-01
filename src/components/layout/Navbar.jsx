import React from 'react';
import { Menu, X, Target } from 'lucide-react';

export default function Navbar({ isMenuOpen, onToggleMenu, showBadge = true }) {
  return (
    <nav className="mobile-navbar" style={{
      display: 'none', // Hidden on desktop via CSS
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 1100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          background: 'var(--accent-color)', 
          color: 'white', 
          padding: '6px', 
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Target size={20} />
        </div>
        <span style={{ fontWeight: '700', fontSize: '1rem', color: 'white' }}>Nesc'Advert</span>
      </div>

      <button 
        onClick={onToggleMenu}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'white', 
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Global CSS for Mobile Navbar visibility */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .mobile-navbar { display: flex !important; }
        }
      ` }} />
    </nav>
  );
}
