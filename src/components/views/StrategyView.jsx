import React from 'react';
import { TrendingUp, Target, ShieldCheck, Clock, Zap, CreditCard, ChevronRight } from 'lucide-react';

export default function StrategyView() {
  const strategySections = [
    {
      title: "Proposition de Valeur",
      icon: Target,
      content: "Mettre en place un système qui vous aide à repérer chaque jour de nouveaux prospects sur LinkedIn, à les trier automatiquement selon leur potentiel, et à préparer la meilleure première prise de contact."
    },
    {
      title: "Bénéfices Principaux",
      icon: Zap,
      points: [
        "Réduire fortement le temps passé à chercher et trier des prospects",
        "Concentrer vos efforts sur les contacts les plus prometteurs",
        "Rendre la prospection plus régulière et structurée",
        "Éviter les oublis et les pertes d'informations"
      ]
    },
    {
      title: "Méthodologie de Scoring",
      icon: ShieldCheck,
      content: "Analyse IA des leads avec classement automatique :",
      subPoints: [
        { label: "Hot", desc: "À contacter en priorité (Haute intention)" },
        { label: "Warm", desc: "Intéressants, mais à suivre (Intérêt modéré)" },
        { label: "Cold", desc: "Peu prioritaires (Veille uniquement)" }
      ]
    }
  ];

  return (
    <div className="view-container">
      <header className="view-header" style={{ background: 'transparent', borderBottomColor: 'var(--border-subtle)' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }}>Stratégie Commerciale</h1>
          <p style={{ color: 'var(--text-muted)' }}>Nesc'Advert Lead Intelligence Framework</p>
        </div>
      </header>

      <div className="view-content grid-2-to-1" style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {strategySections.map((section, idx) => (
            <div key={idx} className="chart-panel" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <section.icon size={20} className="text-accent" />
                  <h3 style={{ color: 'var(--text-primary)' }}>{section.title}</h3>
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {section.content && <p style={{ marginBottom: section.points ? '1rem' : 0 }}>{section.content}</p>}
                {section.points && (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {section.points.map((p, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '8px' }}>
                        <ChevronRight size={16} className="text-accent" style={{ marginTop: '4px' }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
                {section.subPoints && (
                  <div className="grid-3" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    {section.subPoints.map((sp, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <span className={`badge level-${sp.label.toLowerCase()}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{sp.label}</span>
                        <p style={{ fontSize: '0.8rem' }}>{sp.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="chart-panel" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
             <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={20} className="text-accent" />
                  <h3 style={{ color: 'var(--text-primary)' }}>Calendrier d'Implémentation</h3>
                </div>
              </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '1rem 0', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center', zIndex: 1, minWidth: '80px', flex: '1' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>1</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Accès & Audit</p>
                </div>
                <div style={{ textAlign: 'center', zIndex: 1, minWidth: '80px', flex: '1' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>2</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Construction Workflow</p>
                </div>
                <div style={{ textAlign: 'center', zIndex: 1, minWidth: '80px', flex: '1' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>3</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Calibration IA</p>
                </div>
                <div style={{ textAlign: 'center', zIndex: 1, minWidth: '80px', flex: '1' }}>
                   <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-color)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>4</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Lancement & Formation</p>
                </div>
                <div className="desktop-only" style={{ position: 'absolute', top: '26px', left: '10%', right: '10%', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--accent-color)', marginTop: '1rem' }}>Livraison sous 5 jours ouvrés</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="stat-card" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)', flexDirection: 'column', alignItems: 'start', padding: '2rem' }}>
            <div className="stat-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent-color)', marginBottom: '1rem' }}>
              <CreditCard size={24} />
            </div>
            <span className="stat-label">Pack Installation</span>
            <span className="stat-value" style={{ fontSize: '2.5rem', color: 'var(--text-primary)' }}>3 900 €<span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.6 }}>HT</span></span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Installation unique sur 1 poste. Inclut la configuration complète du workflow, le scoring IA et l'intégration du dashboard.</p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', background: 'var(--accent-color)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white', fontWeight: '600' }}>
              Télécharger Proposition PDF
            </button>
          </div>

          <div className="stat-card" style={{ background: 'rgba(0,173,239,0.05)', border: '1px solid var(--accent-color)', flexDirection: 'column', alignItems: 'start', padding: '2rem' }}>
            <span className="stat-label" style={{ color: 'var(--accent-color)' }}>Option Maintenance</span>
            <span className="stat-value" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>250 €<span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.6 }}>/mois</span></span>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <li style={{ marginBottom: '6px' }}>✓ 1h de support / mois</li>
              <li style={{ marginBottom: '6px' }}>✓ Petits ajustements</li>
              <li style={{ marginBottom: '6px' }}>✓ Correctifs mineurs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
