import React from 'react';
import { Film, Sparkles, Heart, Code2 } from 'lucide-react';

export default function Footer({ isBackendReady, onOpenModelInfo, onOpenInsights }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 7, 13, 0.95)',
        paddingTop: '4rem',
        paddingBottom: '3rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--gradient-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Film size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>
                CineMatch <span className="gradient-text">AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '320px' }}>
              Production-grade machine learning movie recommendation engine trained on MovieLens 25M with tuned Random Forest classification.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-highlight)' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.9rem' }}>
              <li>
                <a href="#hero" style={{ color: 'var(--text-secondary)' }}>Home</a>
              </li>
              <li>
                <a href="#recommend-section" style={{ color: 'var(--text-secondary)' }}>Recommendation Engine</a>
              </li>
              <li>
                <a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
              </li>
              <li>
                <button onClick={onOpenModelInfo} style={{ color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                  Model Architecture & Metrics
                </button>
              </li>
              <li>
                <button onClick={onOpenInsights} style={{ color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left' }}>
                  Catalog Dataset Insights
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-highlight)' }}>
              Core Technologies
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['React 19', 'FastAPI', 'Python 3.14', 'Scikit-Learn', 'MovieLens 25M', 'Joblib', 'Vite', 'REST API'].map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#c4b5fd'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isBackendReady ? '#10b981' : '#ef4444',
                  boxShadow: isBackendReady ? '0 0 10px #10b981' : 'none'
                }}
              />
              <span style={{ color: isBackendReady ? '#34d399' : '#f87171', fontWeight: 600 }}>
                {isBackendReady ? 'FastAPI Backend Operational' : 'FastAPI Backend Reconnecting'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>
            © {new Date().getFullYear()} CineMatch AI. Built with Machine Learning & Full Stack Architecture.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Engineered with modern full-stack best practices</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
