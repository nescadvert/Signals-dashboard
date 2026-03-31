import React from 'react';
import { 
  Zap, 
  Target, 
  Users, 
  Archive, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function Overview({ signals, leads, sources }) {
  // Stats calculation
  const totalSignals = signals.length;
  const hotSignals = signals.filter(s => s.level === 'Hot').length;
  const warmSignals = signals.filter(s => s.level === 'Warm').length;
  const coldSignals = signals.filter(s => s.level === 'Cold').length;
  
  // Adjusted logic for Leads ready for outreach
  const readyLeadsCount = leads.filter(l => 
    l.status?.toLowerCase().includes('ready') || 
    l.status?.toLowerCase().includes('qualified')
  ).length;
  
  const activeSourcesCount = sources.filter(src => src.status === 'Active').length;
  const ignoredCount = signals.filter(s => s.status === 'Ignored').length;

  return (
    <div className="overview-container">
      <header className="view-header">
        <div className="header-info">
          <h1>Sales Dashboard</h1>
          <p>Real-time analytics across your workspace.</p>
        </div>
        <div className="header-actions">
          <div className="last-sync-tag">Last sync: {new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon signals"><Zap size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Total Signals</span>
            <span className="stat-value">{totalSignals}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon leads"><Users size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Outreach Ready</span>
            <span className="stat-value">{readyLeadsCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon sources"><TrendingUp size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Active Sources</span>
            <span className="stat-value">{activeSourcesCount}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon archived"><Archive size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Ignored / Archived</span>
            <span className="stat-value">{ignoredCount}</span>
          </div>
        </div>
      </div>

      <div className="main-charts-grid">
        <div className="chart-panel">
          <div className="panel-header">
            <h3>Signal Quality Distribution</h3>
            <BarChart3 size={18} className="text-muted" />
          </div>
          <div className="distribution-bars">
            <div className="dist-item">
              <div className="dist-label-row">
                <span className="dist-label">Hot Opportunities</span>
                <span className="dist-count">{hotSignals}</span>
              </div>
              <div className="progress-bg">
                <div 
                  className="progress-fill hot" 
                  style={{ width: `${totalSignals > 0 ? (hotSignals / totalSignals) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="dist-item">
              <div className="dist-label-row">
                <span className="dist-label">Warm Leads</span>
                <span className="dist-count">{warmSignals}</span>
              </div>
              <div className="progress-bg">
                <div 
                  className="progress-fill warm" 
                  style={{ width: `${totalSignals > 0 ? (warmSignals / totalSignals) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="dist-item">
              <div className="dist-label-row">
                <span className="dist-label">Cold Signals</span>
                <span className="dist-count">{coldSignals}</span>
              </div>
              <div className="progress-bg">
                <div 
                  className="progress-fill cold" 
                  style={{ width: `${totalSignals > 0 ? (coldSignals / totalSignals) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-panel">
          <div className="panel-header">
            <h3>Top Performing Sources</h3>
            <Target size={18} className="text-muted" />
          </div>
          <div className="items-list-preview">
            {sources.length === 0 ? (
              <div className="empty-preview">No sources data available yet.</div>
            ) : (
              sources
                .map(src => {
                  const count = signals.filter(s => 
                    (s.source && (s.source === src.name || s.source === src.id)) || 
                    (s.platform === src.platform && !s.source)
                  ).length;
                  return { ...src, displayCount: count };
                })
                .sort((a,b) => b.displayCount - a.displayCount)
                .slice(0, 5)
                .map(src => (
                  <div key={src.id} className="list-item-mini">
                    <div className="item-info">
                      <span className="item-name">{src.name}</span>
                      <span className="item-meta">{src.platform}</span>
                    </div>
                    <span className="item-badge">{src.displayCount} signals</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
