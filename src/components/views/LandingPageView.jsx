import React, { useState, useEffect } from 'react';
import { Target, ShieldCheck, Zap, ArrowRight, MousePointer2, Layout, Database, Sparkles, CheckCircle2, Loader2, Users, Instagram, Linkedin, Globe, MessageSquare } from 'lucide-react';
import { createProspectInterest } from '../../services/airtableService';

export default function LandingPageView({ signals = [], onSwitchToAdmin }) {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoSignals, setDemoSignals] = useState([]);

  // Load demo signals if none provided
  useEffect(() => {
    if (signals.length === 0 && import.meta.env.PROD) {
      fetch('/api/get-signals')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setDemoSignals(data);
        })
        .catch(err => console.error('Erreur démo signals:', err));
    }
  }, [signals]);

  // Filter and anonymize
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
         <div className="glass-surface" style={{ maxWidth: '500px', padding: '4rem 3rem', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 0 30px var(--accent-glow)' }}>
              <CheckCircle2 size={40} color="white" />
            </div>
            <h2 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '2.5rem' }}>Demande Envoyée !</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.2rem' }}>
              Marie-Pierre vous contactera sous 24h pour organiser votre démonstration.
            </p>
            <button 
              onClick={() => setSubmitted(false)} 
              style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'white', padding: '14px 28px', borderRadius: '16px', cursor: 'pointer', fontWeight: '600' }}
            >
              Retour à l'accueil
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="view-container" style={{ background: 'var(--bg-workspace)', color: 'white', overflowY: 'auto', scrollBehavior: 'smooth' }}>
      
      {/* Premium Hero Section */}
      <section className="landing-hero">
        <div className="hero-glow" />
        
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '3.5rem', backdropFilter: 'blur(5px)' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Commerciale 2.0</span>
        </div>

        <h1 className="text-gradient">
          Identifiez vos futurs clients sur LinkedIn & Instagram.
        </h1>
        <p>
          Détectez automatiquement les intentions d'achat les plus chaudes. Libérez votre équipe commerciale des recherches manuelles ingrates.
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#demo-form" style={{ textDecoration: 'none' }}>
            <button style={{ background: 'var(--accent-color)', color: 'white', padding: '20px 40px', borderRadius: '18px', border: 'none', fontWeight: '800', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 40px -10px var(--accent-glow)' }}>
              Réserver ma Démonstration <ArrowRight size={22} />
            </button>
          </a>
          <button onClick={onSwitchToAdmin} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '20px 40px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '600', fontSize: '1.2rem', cursor: 'pointer' }}>
            Accès Staff
          </button>
        </div>

        {/* Social Proof Bar */}
        <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '40px', opacity: 0.4, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Linkedin size={20}/> LinkedIn </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Instagram size={20}/> Instagram</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={20}/> Google Search</div>
        </div>
      </section>

      {/* Real-Time Demo (Premium Grid) */}
      <section style={{ maxWidth: '1200px', margin: '6rem auto 10rem', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ color: 'var(--accent-color)', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>Flux en temps réel</span>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '1.5rem' }}>L'Agent IA en action</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Derniers signaux "Hot" identifiés par notre algorithme propriétaire.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {displaySignals.length > 0 ? (
            displaySignals.map((sig, idx) => (
              <div key={idx} className="demo-card-v2" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px 12px', background: 'var(--accent-soft)', color: 'var(--accent-color)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '900' }}>
                  QUALIFIÉ HOT
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem' }}>{sig.author}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Identifié le {sig.displayDate}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-sidebar)', lineHeight: '1.6', fontStyle: 'italic' }}>
                    "{sig.postText}"
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>FIABILITÉ IA</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-color)' }}>{sig.finalScore}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SEGMENT</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{sig.businessModelType || 'Produit'}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', borderRadius: '24px', border: '2px dashed rgba(255,255,255,0.05)' }}>
              <Loader2 className="animate-spin" size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Connexion aux serveurs Nesc'Advert...</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Showcase Section */}
      <section style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0, 173, 239, 0.05) 50%, transparent 100%)', padding: '10rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '3rem' }}>
              Ne laissez plus vos opportunités <span style={{ opacity: 0.5 }}>s'évaporer.</span>
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {[
                { icon: <Zap color="#ef4444"/>, title: "Détection Instantanée", desc: "Soyez le premier au courant quand un prospect exprime un besoin." },
                { icon: <ShieldCheck color="#10b981"/>, title: "Qualification de Précision", desc: "Notre IA filtre 95% du 'bruit' pour ne garder que les prospects les plus qualifiés pour votre activité." },
                { icon: <MessageSquare color="#00ADEF"/>, title: "Messages Personnalisés", desc: "Des scripts LinkedIn/Instagram générés spécifiquement pour chaque post détecté." }
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '2rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {feat.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px' }}>{feat.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative' }}>
             <div className="glass-surface" style={{ borderRadius: '32px', padding: '1rem', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)', overflow: 'hidden' }}>
                <div style={{ width: '100%', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#000' }}>
                   {/* Vidéo de démo interface */}
                   <img 
                    src="/video/dashboard-demo.webp" 
                    alt="Interface Demo" 
                    style={{ width: '100%', display: 'block' }} 
                   />
                </div>
             </div>
             {/* Dynamic Floatings */}
             <div style={{ position: 'absolute', top: '5%', right: '-40px', background: '#10b981', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 10px 30px rgba(16,185,129,0.4)', zIndex: 2 }}>98% IA MATCH</div>
             <div style={{ position: 'absolute', bottom: '10%', left: '-30px', background: '#00ADEF', color: 'white', padding: '14px 24px', borderRadius: '14px', fontWeight: '900', boxShadow: '0 10px 30px rgba(0,173,239,0.4)', zIndex: 2 }}>LEAD CHAUD</div>
          </div>
        </div>
      </section>

      {/* Modern Contact Form (Conversion focus) */}
      <section id="demo-form" style={{ padding: '8rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div className="glass-surface" style={{ padding: '5rem 4rem', borderRadius: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1.5rem' }}>Passons à la vitesse <span className="text-accent">supérieure.</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '4rem' }}>Organisons votre démonstration personnalisée gratuite.</p>
          
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '800', opacity: 0.6 }}>Nom complet</label>
                <input 
                  type="text" 
                  placeholder="Jean Dupont"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 24px', borderRadius: '16px', color: 'white', outline: 'none', fontSize: '1.1rem' }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '800', opacity: 0.6 }}>Email PRO</label>
                <input 
                  type="email" 
                  placeholder="jean@entreprise.com"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 24px', borderRadius: '16px', color: 'white', outline: 'none', fontSize: '1.1rem' }}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '4rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '800', opacity: 0.6 }}>Entreprise / Agence</label>
              <input 
                type="text" 
                placeholder="Votre magnifique entreprise"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '18px 24px', borderRadius: '16px', color: 'white', outline: 'none', fontSize: '1.1rem' }}
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ width: '100%', background: 'var(--accent-color)', border: 'none', padding: '24px', borderRadius: '20px', color: 'white', fontWeight: '900', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s ease', boxShadow: '0 20px 40px -10px var(--accent-glow)' }}
            >
              {isSubmitting ? <Loader2 size={30} className="animate-spin" /> : <>Réserver mon créneau <ArrowRight size={24} /></>}
            </button>
          </form>
        </div>
      </section>

      <footer style={{ padding: '8rem 2rem 4rem', textAlign: 'center', background: 'linear-gradient(0deg, var(--bg-card) 0%, transparent 100%)' }}>
        <p style={{ opacity: 0.3, marginBottom: '2rem' }}>© {new Date().getFullYear()} Nesc'Advert AI Agent. Data-Driven Sales Intelligence.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Linkedin size={20} style={{ opacity: 0.3 }} />
          <Instagram size={20} style={{ opacity: 0.3 }} />
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 173, 239, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(0, 173, 239, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 173, 239, 0); }
        }
        ::placeholder { color: rgba(255,255,255,0.2) !important; }
      ` }} />
    </div>
  );
}
