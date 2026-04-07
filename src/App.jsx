import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Overview from './components/views/Overview';
import SignalsView from './components/views/SignalsView';
import SourcesView from './components/views/SourcesView';
import LeadsView from './components/views/LeadsView';
import StrategyView from './components/views/StrategyView';
import LandingPageView from './components/views/LandingPageView';
import LoginView from './components/views/LoginView';
import { fetchSignals, fetchSources, fetchLeads, setAdminToken as setAirtableToken } from './services/airtableService';
import { setAdminToken as setAIAdminToken } from './services/aiService';
import { Loader2 } from 'lucide-react';

function App() {
  // Par défaut, on affiche la landing page pour le public
  const [activeView, setActiveView] = useState('landing-page');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [data, setData] = useState({
    signals: [],
    sources: [],
    leads: [],
    loading: true,
    error: null
  });

  const loadWorkspaceData = async () => {
    // Si on est sur la landing page, on n'a pas besoin de tout charger en admin
    if (activeView === 'landing-page') return;

    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [signals, sources, leads] = await Promise.all([
        fetchSignals(),
        fetchSources(),
        fetchLeads()
      ]);
      
      setData({
        signals,
        sources,
        leads,
        loading: false,
        error: null
      });
    } catch (err) {
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Échec de synchronisation. Vérifiez votre connexion admin.' 
      }));
    }
  };

  useEffect(() => {
    // Au chargement, on vérifie si on demande l'admin via l'URL
    if (window.location.hash === '#admin') {
      setActiveView('overview');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaceData();
    }
  }, [isAuthenticated, activeView]);

  const handleViewChange = (view) => {
    setActiveView(view);
    setIsMenuOpen(false); // Ferme le menu sur mobile après sélection
  };

  const handleLogin = (token) => {
    setAirtableToken(token);
    setAIAdminToken(token);
    setIsAuthenticated(true);
  };

  // Déterminer si on doit afficher le Sidebar (uniquement en admin authentifié)
  const showSidebar = activeView !== 'landing-page' && isAuthenticated;

  const renderView = () => {
    // Si on n'est pas sur la landing page et pas authentifié -> Login
    if (activeView !== 'landing-page' && !isAuthenticated) {
      return <LoginView onLogin={handleLogin} />;
    }

    const hasData = data.signals.length > 0 || data.sources.length > 0;
    
    // Loader pour les vues admin
    if (data.loading && !hasData && activeView !== 'landing-page') {
      return (
        <div className="workspace-loading" style={{ background: 'var(--bg-workspace)', color: 'white' }}>
          <Loader2 size={48} className="animate-spin text-accent" />
          <p style={{ marginTop: '1rem', fontWeight: '600' }}>Chargement de l'espace Nesc'Advert...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'overview':
        return <Overview signals={data.signals} leads={data.leads} sources={data.sources} />;
      case 'signals':
        return <SignalsView signals={data.signals} sources={data.sources} onRefresh={loadWorkspaceData} />;
      case 'sources':
        return <SourcesView sources={data.sources} signals={data.signals} onRefresh={loadWorkspaceData} />;
      case 'leads':
        return <LeadsView leads={data.leads} onRefresh={loadWorkspaceData} />;
      case 'strategy':
        return <StrategyView />;
      case 'landing-page':
        return <LandingPageView signals={data.signals} onSwitchToAdmin={() => setActiveView('overview')} />;
      default:
        return <LandingPageView />;
    }
  };

  return (
    <div className={`workspace-layout ${!showSidebar ? 'full-width' : ''}`}>
      {showSidebar && (
        <>
          <Navbar isMenuOpen={isMenuOpen} onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />
          <Sidebar 
            activeView={activeView} 
            onViewChange={handleViewChange} 
            onLogout={() => setIsAuthenticated(false)} 
            isOpen={isMenuOpen}
          />
        </>
      )}
      <main className="workspace-main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
