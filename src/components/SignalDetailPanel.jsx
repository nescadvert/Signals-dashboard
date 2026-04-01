import React, { useState } from 'react';
import { ExternalLink, Sparkles, User, Target, BarChart3, MessageSquare, Loader2, BrainCircuit, Trash2, Copy, CheckCircle2, UserPlus, Check } from 'lucide-react';

export default function SignalDetailPanel({ signal, onStatusUpdate, onAIAnalysis, onDelete, onDMStatusUpdate, onCreateLead }) {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingDM, setIsUpdatingDM] = useState(false);
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const date = new Date(signal.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
  });

  const getLevelClass = (level) => {
    const l = String(level).toLowerCase();
    if (l.includes('hot')) return 'level-hot';
    if (l.includes('warm')) return 'level-warm';
    if (l.includes('cold')) return 'level-cold';
    return '';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(newStatus);
    await onStatusUpdate(signal.id, newStatus);
    setUpdatingStatus(null);
  };

  const handleRunAI = async () => {
    setIsGeneratingAI(true);
    console.log(`Starting AI Analysis for signal ${signal.id}...`);
    try {
      await onAIAnalysis(signal.id);
      console.log('AI Analysis completed successfully.');
    } catch (err) {
      console.error('SignalDetailPanel AI Error:', err);
      alert(`--- ALERTE DEBUG --- : ${err.message}`);
    } finally {
      console.log('Resetting loading state.');
      setIsGeneratingAI(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onDelete(signal.id);
    if (!success) setIsDeleting(false);
  };

  const handleMarkAsSent = async () => {
    setIsUpdatingDM(true);
    await onDMStatusUpdate(signal.id, 'Sent');
    setIsUpdatingDM(false);
  };

  const handleCreateLead = async () => {
    setIsCreatingLead(true);
    const success = await onCreateLead(signal.id);
    if (success) {
      setLeadCreated(true);
      setTimeout(() => setLeadCreated(false), 3000);
    }
    setIsCreatingLead(false);
  };

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-author-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, flex: 1 }}>
            {signal.reason ? (
              <div 
                className="score-badge-large" 
                style={{ backgroundColor: getScoreColor(signal.score) }}
              >
                {signal.score}
              </div>
            ) : (
              <div className="new-signal-badge-large">
                <BrainCircuit size={24} />
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 className="detail-author">{signal.author}</h2>
              <div className="detail-meta-row">
                <span className={`badge level-badge ${getLevelClass(signal.level)}`}>{signal.level}</span>
                <span className="badge badge-platform">{signal.platform}</span>
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <button 
              className="btn btn-icon-danger" 
              onClick={handleDelete}
              disabled={isDeleting || isGeneratingAI}
              title="Supprimer définitivement"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </button>
            <a 
              href={signal.authorProfileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary"
              style={{ gap: '8px' }}
              title="View Profile"
            >
              <User size={18} />
              Profile
            </a>
            <a 
              href={signal.postUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
              style={{ gap: '8px' }}
            >
              <ExternalLink size={18} />
              Open Post
            </a>
          </div>
        </div>
        
        <div className="detail-meta">
          <span className="badge badge-priority" style={{ background: '#f8fafc' }}>{date}</span>
        </div>

        {signal.postImage && (
          <div className="detail-image-container">
            <img src={signal.postImage} alt="Post content" className="detail-post-image" />
          </div>
        )}

        <div className="detail-text">
          {signal.postText}
        </div>

        <div className="workflow-actions">
          <button 
            className={`btn ${leadCreated ? 'btn-success' : 'btn-primary'}`}
            style={{ 
              background: leadCreated ? '#10b981' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              fontWeight: '600'
            }}
            onClick={handleCreateLead}
            disabled={isCreatingLead || leadCreated}
          >
            {isCreatingLead ? (
              <Loader2 size={16} className="animate-spin" />
            ) : leadCreated ? (
              <Check size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            {isCreatingLead ? 'Creating...' : leadCreated ? 'Lead Created' : 'Export to CRM'}
          </button>
          
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>

          <button 
            className="btn btn-secondary" 
            onClick={() => handleStatusChange('To Outreach')}
            disabled={!!updatingStatus || isGeneratingAI || isDeleting || isCreatingLead}
          >
            {updatingStatus === 'To Outreach' ? <Loader2 size={16} className="animate-spin" /> : 'To Outreach'}
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => handleStatusChange('Ignored')}
            disabled={!!updatingStatus || isGeneratingAI || isDeleting || isCreatingLead}
          >
            {updatingStatus === 'Ignored' ? <Loader2 size={16} className="animate-spin" /> : 'Ignore'}
          </button>
        </div>
      </div>

      <div className="ai-panel">
        <div className="ai-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} />
            <h3>AI Intelligence & Analysis</h3>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleRunAI}
            disabled={isGeneratingAI || !!updatingStatus || isDeleting}
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              padding: '0.5rem 1rem',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
            }}
          >
            {isGeneratingAI ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <BrainCircuit size={18} />
            )}
            {isGeneratingAI ? 'Generating...' : 'Generate AI Analysis'}
          </button>
        </div>
        
        <div className="ai-content">
          {/* Scoring Grid */}
          <div className="ai-card">
            <div className="ai-card-grid">
              <div className="ai-field-block">
                <div className="ai-field-label">Final Score</div>
                <div className="score-display large">{signal.finalScore}</div>
              </div>
              <div className="ai-field-block">
                <div className="ai-field-label">Intent Score</div>
                <div className="score-display">{signal.intentScore}</div>
              </div>
              <div className="ai-field-block">
                <div className="ai-field-label">Activity Score</div>
                <div className="score-display">{signal.activityScore}</div>
              </div>
            </div>
          </div>

          <div className="ai-card">
            <div className="ai-field-label">Detected Signals</div>
            <div className="signals-tag-cloud">
              {Array.isArray(signal.signalsDetected) && signal.signalsDetected.length > 0 ? (
                signal.signalsDetected.map((tag, i) => (
                  <span key={i} className="signal-tag">{tag}</span>
                ))
              ) : (
                <span className="ai-field-value" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  No specific signals detected. Run AI analysis to identify patterns.
                </span>
              )}
            </div>
          </div>

          <div className="ai-grid-two-col">
            <div className="ai-card">
              <div className="ai-header-small"><Target size={16}/> Reasoning</div>
              <div className={`ai-field-value ${!signal.reason ? 'text-preview' : ''}`}>
                {signal.reason || "AI analysis will explain why this is a relevant opportunity..."}
              </div>
            </div>
            <div className="ai-card">
              <div className="ai-header-small"><BarChart3 size={16}/> Next Action</div>
              <div className={`ai-field-value ${!signal.nextAction ? 'text-preview' : ''}`}>
                {signal.nextAction || "Recommendation for your next outreach step..."}
              </div>
            </div>
          </div>

          <div className="ai-grid-two-col">
            <div className="ai-card highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="ai-header-small"><MessageSquare size={16}/> Suggested DM</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-icon-small" 
                    onClick={() => handleCopy(signal.suggestedDM, 'dm')}
                    title="Copy DM"
                  >
                    {copiedField === 'dm' ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                  {signal.dmStatus === 'Ready' && (
                    <button 
                      className="btn-pill-success" 
                      onClick={handleMarkAsSent}
                      disabled={isUpdatingDM || !!updatingStatus || isGeneratingAI}
                    >
                      {isUpdatingDM ? <Loader2 size={12} className="animate-spin" /> : 'Sent'}
                    </button>
                  )}
                  {signal.dmStatus === 'Sent' && (
                    <span className="badge-sent-check">✓</span>
                  )}
                </div>
              </div>
              <div className={`ai-field-value outreach-text ${!signal.suggestedDM ? 'draft-preview' : ''}`}>
                {signal.suggestedDM || "A personalized DM will be drafted here."}
              </div>
            </div>

            <div className="ai-card highlight-alt">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="ai-header-small"><MessageSquare size={16}/> Suggested Comment</div>
                <button 
                  className="btn-icon-small" 
                  onClick={() => handleCopy(signal.suggestedComment, 'comment')}
                  title="Copy Comment"
                >
                  {copiedField === 'comment' ? <CheckCircle2 size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
              <div className={`ai-field-value outreach-text ${!signal.suggestedComment ? 'draft-preview' : ''}`}>
                {signal.suggestedComment || "A thoughtful public comment will be drafted here."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
