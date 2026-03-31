import React, { useState, useEffect } from 'react';
import { Target, ShieldCheck, Zap, ArrowRight, MousePointer2, Layout, Database, Sparkles, CheckCircle2, Loader2, Users } from 'lucide-react';
import { createProspectInterest } from '../../services/airtableService';

export default function LandingPageView({ signals = [], onSwitchToAdmin }) {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoSignals, setDemoSignals] = useState([]);

  // Charger les signaux de démo si on n'en a pas reçu en props (cas public prod)
  useEffect(() => {
    // On ne cherche à appeler l'API que si on est en production
    if (signals.length === 0 && import.meta.env.PROD) {
      fetch('/api/get-signals')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setDemoSignals(data);
        })
        .catch(err => console.error('Erreur démo signals:', err));
    }
  }, [signals]);

  // Filtrer et anonymiser les signaux pour la démo
  const displaySignals = signals.length > 0
    ? signals
        .filter(s => s.level === 'Hot')
        .slice(0, 3)
        .map(s => {
          const parts = (s.author || 'Prospect').trim().split(' ');
          return {
            author: parts.length > 1 ? `${parts[0]} ${parts[parts.length-1][0]}.` : parts[0],
            postText: s.postText,
            finalScore: s.finalScore,
            businessModelType: s.businessModelType,
            displayDate: new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          };
        })
    : demoSignals;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setIsSubmitting(true);
    try {
      await createProspectInterest(formData);
      setSubmitted(true);
    } catch (err) {
      alert("Désolé, une erreur est survenue lors de l'envoi : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--bg-workspace)' }}>
         <div style={{ maxWidth: '500px', padding: '3rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--accent-glow)', boxShadow: 'var(--shadow-glow)' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--accent-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={40} color="white" />
            </div>
            <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: '2rem' }}>Demande Envoyée !</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.1rem' }}>
              Merci de votre intérêt pour <strong>Nesc'Advert AI Agent</strong>. <br/>
              Marie-Pierre vous contactera sous 24h pour organiser votre démonstration personnalisée.
            </p>
            <button 
              onClick={() => setSubmitted(false)} 
              style={{ marginTop: '2.5rem', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'white', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer' }}
            >
              Retour à l'accueil
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="view-container" style={{ background: 'var(--bg-workspace)', color: 'white', overflowY: 'auto' }}>
      {/* Hero Section */}
      <section style={{ padding: '6rem 4rem', textAlign: 'center', background: 'radial-gradient(circle at top, var(--accent-soft) 0%, transparent 70%)', position: 'relative' }}>
         <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '24px', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
          <Sparkles size={16} className="text-accent" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intelligence de Leads par IA</span>
        </div>
        <h1 style={{ fontSize: '3.8rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', maxWidth: '950px', margin: '0 auto 1.5rem', letterSpacing: '-0.02em' }}>
          Identifiez vos futurs clients sur <span className="text-accent">LinkedIn</span> chaque jour, automatiquement.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 3rem' }}>
          Gagnez des heures de recherche manuelle et concentrez-vous sur la vente avec notre système de détection et qualification de leads automatisé.
        </p>
        <a href="#demo-form" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'var(--accent-color)', color: 'white', padding: '18px 36px', borderRadius: '14px', border: 'none', fontWeight: '700', fontSize: '1.15rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-glow)' }}>
            Réserver ma Démonstration <ArrowRight size={20} />
          </button>
        </a>
      </section>

      {/* Live Demo Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Démonstration en temps réel</h2>
          <p style={{ color: 'var(--text-muted)' }}>Exemples de signaux "Hot" détectés aujourd'hui par l'agent IA (Anonymisés)</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {displaySignals.length > 0 ? (
            displaySignals.map((sig, idx) => (
              <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-glow)', color: 'white', fontSize: '0.65rem', fontWeight: '800', padding: '4px 10px', borderRadius: '00 0 0 10px' }}>
                  HOT LEAD
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} className="text-accent" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{sig.author}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classé le {sig.displayDate}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                  "{sig.postText}"
                </p>
                <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '1rem' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-color)' }}>Score: {sig.finalScore}%</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Fit: {sig.businessModelType || 'B2B'}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: 'span 3', padding: '3rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '18px', border: '1px dashed var(--border-subtle)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Chargement des données de démonstration...</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '6rem 4rem', background: 'var(--bg-card)', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.8rem', lineHeight: '1.2', marginBottom: '2.5rem' }}>Reprenez le contrôle de votre <span className="text-accent">pipeline commercial.</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {[
                { title: "Libérez votre temps", desc: "Remplacez des heures de veille manuelle par une revue quotidienne de 10 minutes." },
                { title: "Zéro Perte d'Information", desc: "Chaque lead est structuré, scoré et archivé automatiquement s'il n'est pas qualifié." },
                { title: "Scripts Adaptés", desc: "L'IA génère le message de premier contact idéal basé sur le contenu du post détecté." }
              ].map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--accent-soft)', color: 'var(--accent-color)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '6px', fontWeight: '700' }}>{benefit.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
             <div style={{ background: 'var(--bg-workspace)', borderRadius: '24px', border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)' }}>
                <div style={{ height: '320px', width: '100%', background: 'linear-gradient(135deg, rgba(0,173,239,0.15), rgba(30,57,110,0.5))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layout className="text-accent" size={72} style={{ opacity: 0.3 }} />
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '14px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', marginBottom: '10px' }}></div>
                    <div style={{ height: '12px', width: '35%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
                  </div>
                   <div style={{ width: '60px', height: '24px', borderRadius: '6px', background: 'var(--accent-glow)', opacity: 0.9 }}></div>
                </div>
             </div>
             {/* Floating badge */}
             <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'var(--accent-color)', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', boxShadow: 'var(--shadow-glow)', animation: 'pulse 2s infinite' }}>
                LEAD QUALIFIÉ PAR IA
             </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="demo-form" style={{ padding: '8rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Prêt à automatiser votre croissance ?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Remplissez le formulaire ci-dessous pour recevoir une démonstration gratuite.</p>
        
        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-subtle)', textAlign: 'left', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nom complet</label>
              <input 
                type="text" 
                placeholder="Ex: Jean Dupont"
                style={{ background: 'var(--bg-workspace)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '10px', color: 'white', outline: 'none' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Email professionnel</label>
              <input 
                type="email" 
                placeholder="Ex: jean@entreprise.com"
                style={{ background: 'var(--bg-workspace)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '10px', color: 'white', outline: 'none' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Nom de l'entreprise</label>
            <input 
              type="text" 
              placeholder="Ex: Agence LeadGen"
              style={{ background: 'var(--bg-workspace)', border: '1px solid var(--border-subtle)', padding: '14px', borderRadius: '10px', color: 'white', outline: 'none' }}
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ width: '100%', background: 'var(--accent-color)', border: 'none', padding: '18px', borderRadius: '12px', color: 'white', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <>Confirmer ma Demande <ArrowRight size={20} /></>}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            S'installe sur poste local. Vos données restent privées.
          </p>
        </form>
      </section>

      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ marginBottom: '1rem' }}>© {new Date().getFullYear()} Nesc'Advert. Performance Marketing Intelligence.</p>
        <button 
          onClick={onSwitchToAdmin}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Accès Staff
        </button>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 173, 239, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(0, 173, 239, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 173, 239, 0); }
        }
      ` }} />
    </div>
  );
}
