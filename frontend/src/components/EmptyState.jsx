import React from 'react';
import { Clapperboard, Sparkles, Star } from 'lucide-react';

export default function EmptyState({ onScrollToForm }) {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        margin: '2.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(16, 16, 28, 0.5)',
        border: '1px dashed rgba(255, 255, 255, 0.15)'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid rgba(139, 92, 246, 0.25)'
        }}
      >
        <Clapperboard size={30} color="#a78bfa" />
      </div>

      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-highlight)', marginBottom: '0.5rem' }}>
        Your Recommendations Will Appear Here
      </h3>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        Choose a movie you recently watched above, rate it from 1 to 10, and click <strong>"Recommend Movies"</strong> to generate your tailored AI matches.
      </p>

      {onScrollToForm && (
        <button
          onClick={onScrollToForm}
          className="btn-secondary"
          style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
        >
          <Sparkles size={16} color="var(--accent-purple)" />
          <span>Select A Movie Above</span>
        </button>
      )}
    </div>
  );
}
