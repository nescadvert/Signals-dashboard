import React, { useState, useMemo, useEffect } from 'react';
import { 
  updateSignalStatus, 
  updateSignalAnalysis, 
  deleteSignal, 
  archiveSignal, 
  updateDMStatus, 
  triggerScanSignals,
  createLeadFromSignal 
} from '../../services/airtableService';
import { generateSignalAnalysis } from '../../services/aiService';
import FiltersBar from '../FiltersBar';
import SignalList from '../SignalList';
import SignalDetailPanel from '../SignalDetailPanel';
import { Loader2, Sparkles, Archive, Radar, Layers } from 'lucide-react';

export default function SignalsView({ signals, sources = [], onRefresh }) {
  const [selectedSignalId, setSelectedSignalId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    level: '',
    platform: '',
    dmStatus: ''
  });

  // Batch action state
  const [batchingState, setBatchingState] = useState({ 
    isProcessing: false, 
    current: 0, 
    total: 0,
    type: '' 
  });

  const [batchReport, setBatchReport] = useState(null);

  const handleUpdateStatus = async (signalId, newStatus) => {
    try {
      if (newStatus === 'Ignored') {
        const signalToArchive = signals.find(s => s.id === signalId);
        if (!signalToArchive) return false;

        await archiveSignal(signalToArchive);
        await deleteSignal(signalId);
        
        onRefresh(); // Global data sync
        setSelectedSignalId(null);
        return true;
      }

      await updateSignalStatus(signalId, newStatus);
      onRefresh();
      return true;
    } catch (err) {
      alert(`Erreur d'archivage/mise à jour: ${err.message}`);
      return false;
    }
  };

  const handleAIAnalysis = async (signalId, skipRefresh = false) => {
    const signal = signals.find(s => s.id === signalId);
    if (!signal) return false;

    try {
      const analysis = await generateSignalAnalysis(signal);
      
      let finalLevel = analysis.level || 'Cold';
      const coreTargets = ['producer', 'winemaker', 'artisan', 'physical_product_brand'];
      const isCoreTarget = coreTargets.includes(String(analysis.business_model_type).toLowerCase());

      if (!isCoreTarget && finalLevel === 'Hot') {
        finalLevel = 'Warm';
      }

      if (analysis.exclusion_flag) {
        finalLevel = 'Cold';
      }

      await updateSignalAnalysis(signalId, analysis, finalLevel);
      if (!skipRefresh) onRefresh();
      return true;
    } catch (err) {
      console.error(`AI Analysis failed for ${signalId}:`, err);
      throw err;
    }
  };

  const handleBatchAnalyzeAll = async (targetSignals = null) => {
    const list = Array.isArray(targetSignals) ? targetSignals : unanalyzedSignals;
    
    if (list.length === 0) {
      if (!Array.isArray(targetSignals)) alert('Aucun nouveau signal à analyser.');
      return;
    }

    setBatchingState({ isProcessing: true, current: 0, total: list.length, type: 'Analyse' });

    let successCount = 0;
    const errors = [];

    for (let i = 0; i < list.length; i++) {
      const currentSignal = list[i];
      setBatchingState(prev => ({ ...prev, current: i + 1 }));
      try {
        const success = await handleAIAnalysis(currentSignal.id, true);
        if (success) {
          successCount++;
        }
      } catch (err) {
        console.warn(`Cleaning up failed signal ${currentSignal.id}:`, err.message);
        
        // AUTO CLEANUP: 
        // 1. Mark as Error (Status field in Airtable must have 'Error' option!)
        // 2. Archive & Delete
        try {
          await updateSignalStatus(currentSignal.id, 'Error');
          await archiveSignal({ ...currentSignal, status: 'Error' });
          await deleteSignal(currentSignal.id);
          
          errors.push({
            author: currentSignal.author,
            error: `${err.message} (Auto-archivé)`,
            isCleanedUp: true
          });
        } catch (cleanupErr) {
          console.error(`Failed to auto-cleanup ${currentSignal.id}:`, cleanupErr);
          errors.push({
            author: currentSignal.author,
            error: `${err.message} (Echec du nettoyage)`,
            isCleanedUp: false
          });
        }
      }
      
      if (i < list.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setBatchingState({ isProcessing: false, current: 0, total: 0, type: '' });
    setBatchReport({
      total: list.length,
      successCount,
      failCount: errors.length,
      errors
    });
    
    onRefresh();
  };

  const handleBatchArchiveLowScores = async () => {
    const threshold = 50;
    const candidates = signals.filter(s => s.finalScore < threshold && s.status !== 'New' && s.status !== 'Ignored');

    if (candidates.length === 0) {
      alert(`Aucun signal avec un score inférieur à ${threshold} trouvé.`);
      return;
    }

    if (!window.confirm(`Voulez-vous archiver les ${candidates.length} signaux ayant un score < ${threshold} ?`)) {
      return;
    }

    setBatchingState({ isProcessing: true, current: 0, total: candidates.length, type: 'Archivage' });

    for (let i = 0; i < candidates.length; i++) {
        setBatchingState(prev => ({ ...prev, current: i + 1 }));
        try {
            await archiveSignal(candidates[i]);
            await deleteSignal(candidates[i].id);
        } catch (err) {
            console.error(`Failed to archive signal ${candidates[i].id}:`, err);
        }
    }

    setBatchingState({ isProcessing: false, current: 0, total: 0, type: '' });
    onRefresh();
    alert('Nettoyage terminé !');
  };

  const handleDeleteSignal = async (signalId) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try {
      await deleteSignal(signalId);
      onRefresh();
      setSelectedSignalId(null);
      return true;
    } catch (err) {
      alert(`Erreur: ${err.message}`);
      return false;
    }
  };

  const activePlatforms = useMemo(() => {
    return [...new Set(sources.filter(s => s.status === 'Active').map(s => s.platform))];
  }, [sources]);

  const [selectedPlatform, setSelectedPlatform] = useState('All');

  useEffect(() => {
    if (activePlatforms.length > 0 && !activePlatforms.includes(selectedPlatform) && selectedPlatform !== 'All') {
      setSelectedPlatform(activePlatforms[0]);
    }
  }, [activePlatforms, selectedPlatform]);

  const handleScanSignals = async () => {
    if (isScanning || batchingState.isProcessing) return;
    setIsScanning(true);
    try {
      const activeSourcesList = sources.filter(s => s.status === 'Active');
      const sourcesToScan = selectedPlatform === 'All' 
        ? activeSourcesList 
        : activeSourcesList.filter(s => s.platform === selectedPlatform);

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

  const handleUpdateDMStatus = async (signalId, newDMStatus) => {
    try {
      await updateDMStatus(signalId, newDMStatus);
      onRefresh();
      return true;
    } catch (err) {
      alert(`Erreur DM: ${err.message}`);
      return false;
    }
  };

  const handleCreateLead = async (signalId) => {
    const signal = signals.find(s => s.id === signalId);
    if (!signal) return false;
    
    try {
      await createLeadFromSignal(signal);
      onRefresh(); // Refresh leads in background
      return true;
    } catch (err) {
      console.error('Lead creation error:', err);
      alert(`Erreur d'export CRM: ${err.message}`);
      return false;
    }
  };

  const selectedSignal = useMemo(() => {
    return signals.find(s => s.id === selectedSignalId) || null;
  }, [signals, selectedSignalId]);

  const unanalyzedSignals = useMemo(() => {
    return signals.filter(s => (s.status || '').toLowerCase().trim() === 'new');
  }, [signals]);

  const filteredSignals = useMemo(() => {
    return signals.filter(s => {
      if (filters.status && s.status !== filters.status) return false;
      if (filters.level && s.level !== filters.level) return false;
      if (filters.platform && s.platform !== filters.platform) return false;
      if (filters.dmStatus && s.dmStatus !== filters.dmStatus) return false;
      
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchAuthor = s.author.toLowerCase().includes(query);
        const matchText = s.postText.toLowerCase().includes(query);
        if (!matchAuthor && !matchText) return false;
      }
      return true;
    });
  }, [signals, filters]);

  return (
    <div className="view-container">
      <header className="view-header">
        <div className="header-info">
          <h1>Social Signals</h1>
          <p>Review and qualify identified opportunities from LinkedIn.</p>
        </div>
        
        <div className="header-actions">
          {batchingState.isProcessing && (
            <div className="batch-progress-inline">
              <Loader2 size={16} className="animate-spin" />
              <span>{batchingState.current}/{batchingState.total}</span>
            </div>
          )}
          
          <div className="scan-control-group">
            <select 
              className="filter-select" 
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              disabled={isScanning || batchingState.isProcessing || activePlatforms.length === 0}
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
            <button className="btn btn-secondary" onClick={handleScanSignals} disabled={isScanning || batchingState.isProcessing || activePlatforms.length === 0}>
              {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Radar size={18} />}
              <span>Lancer Scan</span>
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => handleBatchAnalyzeAll()} disabled={batchingState.isProcessing}>
            <Sparkles size={18} />
            <span>Analyze {unanalyzedSignals.length} New</span>
          </button>

          <button className="btn btn-danger-ghost" onClick={handleBatchArchiveLowScores} disabled={batchingState.isProcessing}>
            <Archive size={18} />
            <span>Clean &lt;50</span>
          </button>
        </div>
      </header>
      
      <div className={`workspace-view-dual ${selectedSignalId ? 'show-detail' : 'show-list'}`}>
        <div className="view-list-container sidebar-style">
          <FiltersBar filters={filters} setFilters={setFilters} signals={signals} />
          <SignalList 
            signals={filteredSignals} 
            selectedId={selectedSignalId}
            onSelect={setSelectedSignalId}
          />
        </div>
        
        <div className="view-detail-panel">
          {selectedSignalId && (
            <button 
              className="btn btn-secondary mobile-only" 
              onClick={() => setSelectedSignalId(null)}
              style={{ marginBottom: '1rem', display: 'none' }} /* Hidden by default, shown by CSS */
            >
              ← Back to List
            </button>
          )}
          {selectedSignal ? (
            <SignalDetailPanel 
              signal={selectedSignal} 
              onStatusUpdate={handleUpdateStatus}
              onAIAnalysis={handleAIAnalysis}
              onDelete={handleDeleteSignal}
              onDMStatusUpdate={handleUpdateDMStatus}
              onCreateLead={handleCreateLead}
            />
          ) : (
            <div className="detail-empty">
              <Layers size={48} />
              <h2>Select a signal to review</h2>
              <p>Choose an opportunity from the list to view details and AI analysis.</p>
            </div>
          )}
        </div>
      </div>
      {batchReport && (
        <div className="batch-report-overlay">
          <div className="batch-report-modal">
            <div className="report-header">
              <h3>Rapport d'analyse par lot</h3>
              <button className="btn-close" onClick={() => setBatchReport(null)}>✕</button>
            </div>
            
            <div className="report-stats">
              <div className="stat-pill success">✅ {batchReport.successCount} Réussis</div>
              <div className="stat-pill danger">❌ {batchReport.failCount} Échecs</div>
            </div>

            {batchReport.errors.length > 0 ? (
              <div className="report-log">
                <h4>Journal des erreurs</h4>
                <div className="log-container">
                  {batchReport.errors.map((err, idx) => (
                    <div key={idx} className={`log-item ${err.isCleanedUp ? 'cleaned' : ''}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="log-author">{err.author}</span>
                        {err.isCleanedUp && <span className="status-pill-small">Auto-archivé</span>}
                      </div>
                      <span className="log-message">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="report-success-msg">
                🎉 Tous les signaux ont été analysés avec succès !
              </div>
            )}

            <div className="report-footer">
              <button className="btn btn-primary" onClick={() => setBatchReport(null)}>Fermer le journal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
