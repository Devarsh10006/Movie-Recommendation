import React, { useState, useEffect } from 'react';
import { X, BarChart3, Database, Users, Star, Film, Award, Loader2 } from 'lucide-react';
import { getDataInsights } from '../services/api';

export default function DataInsightsModal({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getDataInsights()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Data insights error:', err);
        if (isMounted) {
          setError('Failed to fetch dataset insights from FastAPI backend.');
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(14, 14, 26, 0.98)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.25)',
          padding: '2rem',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={22} color="#a78bfa" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Dataset & Catalog Insights</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Live statistics from MovieLens 25M dataset</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '0.5rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={32} color="var(--accent-purple)" style={{ animation: 'spinSlow 1s linear infinite', margin: '0 auto 1rem' }} />
            <p>Querying catalog database metrics...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
            <p>{error}</p>
          </div>
        ) : data && (
          <div>
            {/* Top 4 Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)' }}>
                <Film size={22} color="#8b5cf6" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-highlight)' }}>
                  {data.total_movies.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Total Movies
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)' }}>
                <Database size={22} color="#ec4899" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ec4899' }}>
                  {data.dense_core_movies.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Dense Core Models
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)' }}>
                <Users size={22} color="#34d399" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34d399' }}>
                  {data.total_users.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Trained Users
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)' }}>
                <Star size={22} fill="#fbbf24" color="#fbbf24" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fbbf24' }}>
                  ★ {data.global_avg_rating}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Global Mean
                </div>
              </div>
            </div>

            {/* Top Genres Distribution */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-highlight)' }}>
                Top Catalog Genres
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {(data.top_genres || []).slice(0, 8).map((genre, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#c4b5fd' }}>{genre.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{genre.count.toLocaleString()} films</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highest Audience Rated Dense Core Movies */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-highlight)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="#fbbf24" />
                <span>Highest Rated MovieLens Dense Core Classics</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(data.top_rated_movies || []).slice(0, 5).map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-highlight)' }}>{m.clean_title || m.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({m.year})</span>
                    </div>
                    <span className="badge badge-gold">★ {m.rating}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
