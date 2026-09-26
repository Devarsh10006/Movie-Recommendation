import React from 'react';
import { AlertCircle, RefreshCw, ServerOff } from 'lucide-react';

export default function ErrorMessage({ error, onRetry }) {
  if (!error) return null;

  const isBackendDown = error.toLowerCase().includes('connect') || error.toLowerCase().includes('backend') || error.toLowerCase().includes('network');

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        padding: '1.5rem',
        margin: '2rem 0',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {isBackendDown ? <ServerOff size={22} color="#ef4444" /> : <AlertCircle size={22} color="#ef4444" />}
        </div>

        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fca5a5' }}>
            {isBackendDown ? 'Backend Connection Notice' : 'Recommendation Notice'}
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#fecaca', marginTop: '0.2rem', maxWidth: '600px' }}>
            {error}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            color: '#fca5a5'
          }}
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
