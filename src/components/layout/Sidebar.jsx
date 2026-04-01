import React from 'react';
import { 
  LayoutDashboard, 
  Rss, 
  Users, 
  Target, 
  Settings, 
  ChevronRight,
  Zap,
  TrendingUp,
  Presentation,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeView, onViewChange, onLogout, isOpen }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'signals', label: 'Signals', icon: Zap },
    { id: 'sources', label: 'Sources', icon: Rss },
    { id: 'leads', label: 'Leads', icon: Users },
  ];

  const strategyItems = [
    { id: 'strategy', label: 'Commercial Strategy', icon: TrendingUp },
    { id: 'landing-page', label: 'Sales Pitch', icon: Presentation },
  ];

  return (
    <div className={`workspace-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">
          <Target size={24} />
        </div>
        <div className="brand-name">
          <span>Nesc'Advert</span>
          <span className="brand-badge">AI AGENT</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <p className="nav-label">Main Workspace</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeView === item.id && <ChevronRight size={16} className="active-indicator" />}
            </button>
          ))}
        </div>

        <div className="nav-section">
          <p className="nav-label">Business Strategy</p>
          {strategyItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {activeView === item.id && <ChevronRight size={16} className="active-indicator" />}
            </button>
          ))}
        </div>

        <div className="nav-section" style={{ marginTop: 'auto' }}>
          <p className="nav-label">System</p>
          <button className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </button>
          <button className="nav-item" onClick={onLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar" style={{ background: 'var(--accent-color)' }}>MP</div>
          <div className="user-info">
            <p className="user-name">Marie-Pierre</p>
            <p className="user-role">Agencies Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
