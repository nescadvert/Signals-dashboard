import React from 'react';

export default function SignalList({ signals, selectedId, onSelect }) {
  
  const getStatusClass = (status) => {
    if (!status) return '';
    const s = String(status).toLowerCase();
    if (s.includes('new')) return 'badge-status-new';
    if (s.includes('reviewed') || s.includes('qualified')) return 'badge-status-reviewed';
    if (s.includes('attempted') || s.includes('to outreach')) return 'badge-status-attempted';
    if (s.includes('closed') || s.includes('ignored')) return 'badge-status-closed';
    return '';
  };

  const getLevelClass = (level) => {
    if (!level) return '';
    const l = String(level).toLowerCase();
    if (l.includes('hot')) return 'level-hot';
    if (l.includes('warm')) return 'level-warm';
    if (l.includes('cold')) return 'level-cold';
    return '';
  };

  const getScoreColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 80) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="signal-list">
      {signals.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <p>No signals found matching your filters.</p>
        </div>
      ) : (
        signals.map(signal => {
          const isSelected = signal.id === selectedId;
          const date = new Date(signal.date).toLocaleDateString();

          return (
            <div 
              key={signal.id} 
              className={`signal-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(signal.id)}
            >
              <div className="signal-header">
                <div className="signal-author-group">
                  <div className="signal-author">{signal.author}</div>
                  <div className="signal-platform">{signal.platform}</div>
                </div>
                {(() => {
                  const status = (signal.status || '').toLowerCase().trim();
                  const isNew = status === 'new';
                  
                  if (!isNew) {
                    return (
                      <div 
                        className="score-badge-circle" 
                        style={{ backgroundColor: getScoreColor(signal.score) }}
                      >
                        {signal.score}
                      </div>
                    );
                  } else {
                    return (
                      <div className="new-signal-indicator">
                        <span className="sparkle-icon">✨</span>
                        New
                      </div>
                    );
                  }
                })()}
              </div>
              
              <div className="signal-preview">
                {signal.postText}
              </div>
              
              <div className="signal-footer">
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <span className={`badge ${getStatusClass(signal.status)}`}>
                    {signal.status}
                  </span>
                  <span className={`badge level-badge ${getLevelClass(signal.level)}`}>
                    {signal.level}
                  </span>
                </div>
                <div className="final-score-peek">
                  <span className="score-value">{signal.finalScore}</span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
