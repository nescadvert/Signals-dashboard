import React, { useState } from 'react';
import { Lock, ArrowRight, Target, ShieldAlert } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation locale pour le développement
    if (password === '17H54m@NoUnou') { 
      onLogin(password);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--bg-workspace)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div style={{ 
        width: '90%', 
        maxWidth: '400px', 
        padding: '2rem 1.5rem', 
        background: 'var(--bg-card)', 
        borderRadius: '24px', 
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'var(--accent-glow)', 
          borderRadius: '18px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem' 
        }}>
          <Lock size={32} color="white" />
        </div>
        
        <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Espace Privé</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Acces réservé à l'administration Nesc'Advert.</p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                background: 'var(--bg-workspace)', 
                border: error ? '1px solid var(--danger)' : '1px solid var(--border-subtle)', 
                padding: '14px', 
                borderRadius: '12px', 
                color: 'white', 
                outline: 'none',
                transition: 'all 0.2s'
              }}
              autoFocus
            />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', position: 'absolute' }}>Mot de passe incorrect</p>}
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              background: 'var(--accent-color)', 
              color: 'white', 
              border: 'none', 
              padding: '16px', 
              borderRadius: '12px', 
              fontWeight: '700', 
              fontSize: '1.1rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            Se connecter <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', opacity: 0.5 }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'white', fontSize: '0.9rem' }}>
              <Target size={16} />
              <span style={{ fontWeight: '700' }}>Nesc'Advert</span>
              <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>AI AGENT</span>
           </div>
        </div>
      </div>
    </div>
  );
}
