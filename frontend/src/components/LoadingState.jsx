import React from 'react';
import { Film, Sparkles, Loader2 } from 'lucide-react';

export default function LoadingState() {
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        margin: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(16, 16, 28, 0.85)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
      }}
    >
      {/* Animated Film Reel Icon */}
      <div style={{ position: 'relative', width: '70px', height: '70px', marginBottom: '1.5rem' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(229, 9, 20, 0.2) 60%, transparent 80%)',
            animation: 'pulseGlow 2s ease-in-out infinite'
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px dashed var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'spinSlow 6s linear infinite'
          }}
        >
          <Film size={32} color="#ec4899" />
        </div>
      </div>

      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Finding Movies You'll Love...</span>
        <Sparkles size={20} color="#fbbf24" />
      </h3>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.5 }}>
        Our tuned Random Forest model is analyzing your rating and searching 62,000+ titles in MovieLens 25M for optimal affinity matches.
      </p>

      {/* Progress pill indicator */}
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: '#c4b5fd'
        }}
      >
        <Loader2 size={14} color="#a78bfa" style={{ animation: 'spinSlow 1s linear infinite' }} />
        <span>Running vectorized model inference...</span>
      </div>
    </div>
  );
}
