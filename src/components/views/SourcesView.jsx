import React, { useState, useEffect } from 'react';
import { Rss, Plus, Search, ExternalLink, Activity, Power, Trash2, Loader2, Radar, XCircle, Edit3, X, Settings } from 'lucide-react';
import { updateSourceStatus, deleteSource, triggerScanSignals, createSource, updateSource } from '../../services/airtableService';

export default function SourcesView({ sources, signals = [], onRefresh }) {
  const [processingId, setProcessingId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  const activePlatforms = [...new Set(sources.filter(s => s.status === 'Active').map(s => s.platform))];
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  useEffect(() => {
    // Safety check for dynamic sources: If the current selection isn't 'All' 
    // and isn't in the active list anymore (e.g. source deleted), reset to first available.
    if (activePlatforms.length > 0 && !activePlatforms.includes(selectedPlatform) && selectedPlatform !== 'All') {
      setSelectedPlatform(activePlatforms[0]);
    }
  }, [activePlatforms, selectedPlatform]);

  const handleScanSignals = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      const activeSources = sources.filter(s => s.status === 'Active');
      const sourcesToScan = selectedPlatform === 'All' 
        ? activeSources 
        : activeSources.filter(s => s.platform === selectedPlatform);

      if (sourcesToScan.length === 0) {
        alert(selectedPlatform === 'All' ? 'Aucune source active à scanner.' : `Aucune source active pour ${selectedPlatform}.`);
        setIsScanning(false);
        return;
      }

      await Promise.all(sourcesToScan.map(src => triggerScanSignals(50, src.platform, src.name, src.keywords, src.id)));
      alert(`${sourcesToScan.length} scans lancés via Make ! Veuillez rafraîchir dans 10 secondes.`);
      
      setTimeout(() => onRefresh(), 10000);
    } catch (err) {
      alert(`Erreur de scan : ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleStatus = async (sourceId, currentStatus) => {
    const nextStatus = currentStatus !== 'Active';
    setProcessingId(sourceId);
    try {
      await updateSourceStatus(sourceId, nextStatus);
      onRefresh();
    } catch (err) {
      alert(`Erreur de mise à jour : ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteSource = async (sourceId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette source ? Tous les signaux associés resteront mais la source sera retirée de la liste.')) {
      return;
    }
    setProcessingId(sourceId);
    try {
      await deleteSource(sourceId);
      onRefresh();
    } catch (err) {
      alert(`Erreur de suppression : ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingSource(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (source) => {
    setEditingSource(source);
    setShowModal(true);
  };

  const handleSubmitSource = async (formData) => {
    try {
      if (editingSource) {
        await updateSource(editingSource.id, formData);
      } else {
        await createSource(formData);
      }
      setShowModal(false);
      onRefresh();
      return true;
    } catch (err) {
      alert(`Erreur : ${err.message}`);
      return false;
    }
  };

  return (
    <div className="view-container">
      <header className="view-header">
        <div className="header-info">
          <h1>Data Sources</h1>
          <p>Manage and monitor your automated scraping sources.</p>
        </div>
        <div className="header-actions">
           <div className="scan-control-group">
             <select 
               className="filter-select" 
               value={selectedPlatform}
               onChange={(e) => setSelectedPlatform(e.target.value)}
               disabled={isScanning || activePlatforms.length === 0}
             >
               {activePlatforms.length === 0 ? (
                 <option value="LinkedIn">No active sources</option>
               ) : (
                 <>
                   <option value="All">Tous les actifs</option>
                   {activePlatforms.map(p => (
                     <option key={p} value={p}>{p}</option>
                   ))}
                 </>
               )}
             </select>
            <button className="btn btn-secondary" onClick={handleScanSignals} disabled={isScanning || activePlatforms.length === 0}>
              {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Radar size={18} />}
              <span>Lancer Scan</span>
            </button>
          </div>
            <button className="btn btn-primary" onClick={handleOpenAddModal} disabled={isScanning}>
             <Plus size={18} />
             <span>Add Source</span>
           </button>
         </div>
       </header>

       <div className="view-content">
         <div className="table-controls">
           <div className="search-box">
             <Search size={18} />
             <input type="text" placeholder="Search sources..." />
           </div>
         </div>

         <div className="data-table-wrapper">
           <table className="data-table">
             <thead>
               <tr>
                 <th>Source Name</th>
                 <th>Platform</th>
                 <th>Status</th>
                 <th>Keywords</th>
                 <th>Signals</th>
                 <th>Last Scan</th>
                 <th>Actions</th>
               </tr>
             </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">No sources data found in your Airtable database.</td>
                </tr>
              ) : (
                sources.map(src => (
                  <tr key={src.id}>
                    <td>
                      <div className="row-title-pair">
                        <div className="source-name-bold">{src.name}</div>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <span className="row-sub-type">{src.type || 'Social'}</span>
                          <span className={`platform-badge ${String(src.platform).toLowerCase()} mobile-only`} style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                            {src.platform}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="desktop-only">
                      <span className={`platform-badge ${String(src.platform).toLowerCase()}`}>
                        {src.platform}
                      </span>
                    </td>
                    <td>
                      <div className={`status-indicator ${src.status.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {src.status}
                      </div>
                    </td>
                    <td className="desktop-only">
                      <div className="keywords-tags">
                        {src.keywords ? src.keywords.split(',').map((kw, i) => (
                          <span key={i} className="kw-tag">{kw.trim()}</span>
                        )) : <span className="text-muted small italic">None</span>}
                      </div>
                    </td>
                    <td className="desktop-only">
                      <div className="metrics-col">
                        <Activity size={14} className="text-accent" />
                        <span>
                          {signals.filter(s => 
                            (s.source && (s.source === src.name || s.source === src.id)) || 
                            (s.platform === src.platform && !s.source)
                          ).length}
                        </span>
                      </div>
                    </td>
                    <td className="desktop-only">
                      <span className="date-cell">
                        {src.lastScan ? new Date(src.lastScan).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td>
                      <div className="table-row-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => handleOpenEditModal(src)}
                          title="Edit source"
                          disabled={processingId === src.id}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className={`btn-icon ${src.status === 'Active' ? 'active' : ''}`}
                          onClick={() => handleToggleStatus(src.id, src.status)}
                          title={src.status === 'Active' ? 'Deactivate' : 'Activate'}
                          disabled={processingId === src.id}
                        >
                          {processingId === src.id ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                        </button>
                        <button 
                          className="btn-icon-danger"
                          onClick={() => handleDeleteSource(src.id)}
                          title="Delete source"
                          disabled={processingId === src.id}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <SourceModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitSource}
          initialData={editingSource}
        />
      )}
    </div>
  );
}

function SourceModal({ onClose, onSubmit, initialData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    platform: initialData?.platform || '',
    keywords: initialData?.keywords || '',
    isActive: initialData ? (initialData.status === 'Active') : true,
    cadence: initialData?.cadence || 'Daily'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter a source name.');
    
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    if (!success) setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', 
              color: 'var(--accent-color)', 
              padding: '10px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(99, 102, 241, 0.1)'
            }}>
              {initialData ? <Settings size={20} /> : <Plus size={20} />}
            </div>
            <h3>{initialData ? 'Edit Source' : 'Create New Source'}</h3>
          </div>
          <button className="btn-close" onClick={onClose} title="Fermer"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Source Name <span className="required">*</span></label>
            <input 
              type="text" 
              placeholder="e.g. AGRI - nouvelle récolte"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Plateforme</label>
              <select 
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">X / Twitter</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="Other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cadence de Scan</label>
              <select 
                value={formData.cadence}
                onChange={(e) => setFormData({...formData, cadence: e.target.value})}
              >
                <option value="Manual">Manuelle</option>
                <option value="Daily">Quotidienne</option>
                <option value="Weekly">Hebdomadaire</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Keywords (Optional)</label>
            <textarea 
              rows="3"
              placeholder="e.g. récolte, agritourisme, artisan..."
              value={formData.keywords}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
            ></textarea>
            <span className="field-hint">Separate keywords with commas.</span>
          </div>

          <div className="form-group checkbox">
            <label className="toggle-label">
              <span className="toggle-text">Active Monitoring & Signal Generation</span>
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <span className="slider"></span>
              </label>
            </label>
            <span className="field-hint" style={{ marginTop: '8px', paddingLeft: '1.25rem' }}>
              Turning this on allows the AI to automatically process new content.
            </span>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (initialData ? 'Save Changes' : 'Create Source')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
