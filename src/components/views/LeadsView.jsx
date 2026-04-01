import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Building2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Clock,
  Edit,
  Trash2,
  X,
  Plus,
  Check,
  AlertTriangle,
  Loader2,
  Settings
} from 'lucide-react';
import { updateLead, deleteLead } from '../../services/airtableService';

export default function LeadsView({ leads, onRefresh }) {
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusClass = (status) => {
    const s = String(status).toLowerCase();
    if (s.includes('new')) return 'lead-status-new';
    if (s.includes('contacted')) return 'lead-status-outreach';
    if (s.includes('follow-up')) return 'lead-status-qualified';
    if (s.includes('discussion')) return 'lead-status-discussion';
    if (s.includes('client')) return 'lead-status-closed';
    if (s.includes('lost')) return 'lead-status-lost';
    return 'lead-status-new';
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const handleUpdateLead = async (leadData) => {
    try {
      await updateLead(selectedLeadId, leadData);
      setIsEditing(false);
      onRefresh();
      return true;
    } catch (err) {
      alert(`Erreur de mise à jour: ${err.message}`);
      return false;
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce lead du CRM ?')) return;
    
    setIsDeleting(true);
    try {
      await deleteLead(selectedLeadId);
      setSelectedLeadId(null);
      onRefresh();
    } catch (err) {
      alert(`Erreur de suppression: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`workspace-view-dual ${selectedLeadId ? 'show-detail' : 'show-list'}`}>
      <div className="view-list-container">
        <header className="view-header">
          <div className="header-info">
            <h1>Leads CRM</h1>
            <p>Track your high-intent leads and manage outreach status.</p>
          </div>
        </header>

        <div className="view-content">
          <div className="table-controls">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search leads..." />
            </div>
          </div>

          <div className="data-table-wrapper">
             {leads.length === 0 ? (
                <div className="empty-state">No leads tracked in your Airtable base yet.</div>
             ) : (
                <table className="data-table selectable">
                  <thead>
                    <tr>
                      <th>Lead Name</th>
                      <th>Status</th>
                      <th className="desktop-only">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr 
                        key={lead.id} 
                        className={selectedLeadId === lead.id ? 'active' : ''}
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <td>
                           <div className="lead-name-cell">
                             <div className="lead-avatar">{lead.name.charAt(0)}</div>
                             <div>
                               <div className="source-name-bold">{lead.name}</div>
                               <div className="row-sub-type">{lead.company || 'Private'}</div>
                             </div>
                           </div>
                        </td>
                        <td>
                           <span className={`status-pill ${getStatusClass(lead.status)}`}>
                             {lead.status}
                           </span>
                        </td>
                        <td className="desktop-only">
                          <div className="follow-up-cell">
                            <Calendar size={14} />
                            <span>{lead.nextFollowUp || 'TBD'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </div>

      <div className="view-detail-panel">
        {selectedLeadId && (
          <button 
            className="btn btn-secondary mobile-only" 
            onClick={() => setSelectedLeadId(null)}
            style={{ marginBottom: '1rem', display: 'none' }}
          >
            ← Back to List
          </button>
        )}
        {selectedLead ? (
          <div className="lead-detail-workspace">
             <header className="lead-detail-header">
                <div className="lead-hero">
                   <div className="lead-avatar large">{selectedLead.name.charAt(0)}</div>
                   <div className="lead-title-group">
                      <h2>{selectedLead.name}</h2>
                      <p>{selectedLead.company || 'Independent Professional'}</p>
                   </div>
                </div>
                <div className="lead-actions-bar">
                   <a 
                     href={`mailto:${selectedLead.email}`} 
                     className={`btn btn-primary ${!selectedLead.email ? 'disabled' : ''}`}
                     tabIndex={!selectedLead.email ? -1 : 0}
                     onClick={(e) => !selectedLead.email && e.preventDefault()}
                   >
                     <Mail size={16} /> Contact Lead
                   </a>
                   <a 
                     href={selectedLead.profileUrl} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className={`btn btn-secondary ${!selectedLead.profileUrl ? 'disabled' : ''}`}
                     tabIndex={!selectedLead.profileUrl ? -1 : 0}
                     onClick={(e) => !selectedLead.profileUrl && e.preventDefault()}
                   >
                     <ExternalLink size={16} /> View Profile
                   </a>
                   <button 
                     className="btn btn-secondary" 
                     onClick={() => setIsEditing(true)}
                     title="Modifier le lead"
                   >
                     <Edit size={16} /> Edit
                   </button>
                   <button 
                     className="btn btn-icon-danger" 
                     onClick={handleDeleteLead}
                     disabled={isDeleting}
                     title="Supprimer définitivement"
                   >
                     {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                   </button>
                </div>
             </header>

             <div className="detail-cards-grid">
               <div className="detail-card">
                 <h3>Contact Info</h3>
                 <div className="info-list">
                    <div className="info-item">
                       <Mail size={14} />
                       <span>{selectedLead.email || 'Email missing'}</span>
                    </div>
                    <div className="info-item">
                       <Phone size={14} />
                       <span>{selectedLead.phone || 'Phone missing'}</span>
                    </div>
                 </div>
               </div>

               <div className="detail-card">
                 <h3>Pipeline Status</h3>
                 <div className="info-list">
                    <div className="info-item">
                       <Clock size={14} />
                       <span>Last contact: {selectedLead.lastContact || 'Never'}</span>
                    </div>
                    <div className="info-item">
                       <Calendar size={14} />
                       <span>Next: {selectedLead.nextFollowUp || 'TBD'}</span>
                    </div>
                 </div>
               </div>
             </div>

             <section className="lead-notes-section">
                <h3>CRM Notes</h3>
                <div className="notes-editor-preview">
                   <MessageSquare size={16} />
                   <div className="notes-text">
                      {selectedLead.notes || 'No activity notes found for this lead.'}
                   </div>
                </div>
             </section>
          </div>
        ) : (
          <div className="detail-empty">
            <Users size={64} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p>Select a qualified lead from the list to view their workspace and management tools.</p>
          </div>
        )}
      </div>

      {isEditing && (
        <LeadModal 
          initialData={selectedLead} 
          onClose={() => setIsEditing(false)} 
          onSubmit={handleUpdateLead} 
        />
      )}
    </div>
  );
}

function LeadModal({ onClose, onSubmit, initialData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    company: initialData?.company || '',
    status: initialData?.status || 'New',
    level: initialData?.level || 'Cold',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    profileUrl: initialData?.profileUrl || '',
    title: initialData?.title || '',
    website: initialData?.website || '',
    notes: initialData?.notes || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    if (!success) setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', 
              color: 'var(--accent-color)', 
              padding: '10px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={20} />
            </div>
            <h3>Edit Lead CRM</h3>
          </div>
          <button className="btn-close" onClick={onClose} title="Fermer"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-scroll-area" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="ai-grid-two-col">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName} 
                  onChange={e => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="Lead First Name"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName} 
                  onChange={e => setFormData({...formData, lastName: e.target.value})} 
                  placeholder="Lead Last Name"
                />
              </div>
            </div>

            <div className="ai-grid-two-col">
              <div className="form-group">
                <label>Company</label>
                <input 
                  type="text" 
                  value={formData.company} 
                  onChange={e => setFormData({...formData, company: e.target.value})} 
                  placeholder="Company Name"
                />
              </div>
              <div className="form-group">
                <label>Title / Role</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g. CEO, Founder"
                />
              </div>
            </div>

            <div className="ai-grid-two-col">
              <div className="form-group">
                <label>Pipeline Status</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="In discussion">In discussion</option>
                  <option value="Client">Client</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
              <div className="form-group">
                <label>Level</label>
                <select 
                  value={formData.level} 
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
            </div>

            <div className="ai-grid-two-col">
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="lead@example.com"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input 
                  type="text" 
                  value={formData.profileUrl} 
                  onChange={e => setFormData({...formData, profileUrl: e.target.value})} 
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>AI Scores (Read-only)</label>
              <div className="score-summary-bar" style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem', 
                background: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div className="score-item">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Intent</div>
                  <div style={{ fontWeight: 'bold' }}>{initialData.intentScore}</div>
                </div>
                <div className="score-item">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Activity</div>
                  <div style={{ fontWeight: 'bold' }}>{initialData.activityScore}</div>
                </div>
                <div className="score-item">
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Final</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>{initialData.finalScore}</div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea 
                rows="6" 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes about this lead..."
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {initialData ? 'Enregistrer les modifications' : 'Créer le Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
