import React from 'react';
import { ThumbsUp, ThumbsDown, Sparkles, Star, TrendingUp, CheckCircle } from 'lucide-react';

export default function PredictCard({ prediction }) {
  if (!prediction) return null;

  const isLiked = prediction.is_liked;
  const matchPct = prediction.match_score_pct || Math.round(prediction.confidence * 100);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        marginBottom: '2.5rem',
        background: isLiked
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 20, 35, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(20, 20, 35, 0.8) 100%)',
        border: `1px solid ${isLiked ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: isLiked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isLiked ? (
              <ThumbsUp size={24} color="#10b981" />
            ) : (
              <ThumbsDown size={24} color="#ef4444" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={isLiked ? 'badge badge-emerald' : 'badge badge-crimson'}>
                {isLiked ? 'High Affinity Prediction' : 'Low Affinity Match'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Tuned Random Forest Model
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.35rem' }}>
              {prediction.clean_title || prediction.movie_title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: isLiked ? '#6ee7b7' : '#fca5a5', marginTop: '0.2rem' }}>
              {prediction.recommendation_verdict}
            </p>
          </div>
        </div>

        {/* Confidence pill */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: isLiked ? '#34d399' : '#f87171', fontFamily: 'var(--font-heading)' }}>
            {matchPct}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Model Confidence
          </div>
        </div>
      </div>

      {/* Feature comparison bar */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          fontSize: '0.85rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Your Calibrated Rating: </span>
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>★ {prediction.user_avg_rating} / 5.0</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Historical MovieLens Average: </span>
          <span style={{ fontWeight: 700, color: '#fbbf24' }}>★ {prediction.movie_avg_rating} / 5.0</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Catalog Classification: </span>
          <span style={{ fontWeight: 700, color: '#c4b5fd' }}>{prediction.is_liked ? 'Liked Tier (≥ 4.0)' : 'Below Threshold (< 4.0)'}</span>
        </div>
      </div>
    </div>
  );
}
