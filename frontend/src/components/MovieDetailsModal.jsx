import React, { useEffect, useState } from 'react';
import { X, Star, Sparkles, ExternalLink, Film, CheckCircle2, Loader2 } from 'lucide-react';
import { getMovieDetails } from '../services/api';

export default function MovieDetailsModal({ movie, sourceMovie, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;

    let isMounted = true;
    setLoading(true);

    getMovieDetails(movie.movie_id)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching details:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [movie]);

  if (!movie) return null;

  const matchPct = movie.match_score_pct || Math.round((movie.predicted_probability || 0.9) * 100);
  const imdbUrl = movie.imdb_id
    ? `https://www.imdb.com/title/tt${movie.imdb_id}/`
    : (details?.imdb_url || null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'rgba(14, 14, 26, 0.98)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.25)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Modal Header Artwork Banner */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, #1e1035 0%, #111827 50%, #2e0818 100%)',
            position: 'relative',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              transition: 'background 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)')}
          >
            <X size={18} />
          </button>

          {/* Top badges */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-purple">
              <Sparkles size={12} />
              {matchPct}% Match
            </span>
            <span className="badge badge-gold">
              <Star size={12} fill="#fbbf24" color="#fbbf24" />
              ★ {movie.movie_avg_rating} / 5.0
            </span>
            <span className="badge badge-emerald">
              {movie.recommendation || 'Must Watch'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600 }}>
              {movie.year && movie.year !== 'N/A' ? `${movie.year} • ` : ''}
              {(Array.isArray(movie.genres_list)
                ? movie.genres_list
                : (Array.isArray(movie.genres)
                  ? movie.genres
                  : (typeof movie.genres === 'string' ? movie.genres.split('|').filter(Boolean) : []))).join(' • ')}
            </span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {movie.clean_title || movie.title}
            </h2>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '1.75rem' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '0.75rem', color: 'var(--text-secondary)' }}>
              <Loader2 size={24} color="var(--accent-purple)" style={{ animation: 'spinSlow 1s linear infinite' }} />
              <span>Loading movie details from catalog...</span>
            </div>
          ) : (
            <div>
              {/* Overview Synopsis */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Synopsis & Audience Consensus
                </h4>
                <p style={{ fontSize: '0.975rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  {details?.overview ||
                    `'${movie.clean_title || movie.title}' is a verified title in the MovieLens 25M catalog, holding an average user rating of ★ ${movie.movie_avg_rating} out of 5.0 across thousands of reviews.`}
                </p>
              </div>

              {/* ML Recommendation Rationale */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <CheckCircle2 size={16} color="#a78bfa" />
                  <span>Why CineMatch AI Recommended This:</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {sourceMovie ? (
                    <>
                      Based on your rating of{' '}
                      <strong style={{ color: 'var(--text-highlight)' }}>
                        {sourceMovie.clean_title || sourceMovie.title}
                      </strong>
                      , our Random Forest classifier predicted a {matchPct}% affinity score due to shared thematic elements and high viewer approval.
                    </>
                  ) : (
                    details?.recommendation_explanation ||
                    `This title was selected because its historical audience rating (★ ${movie.movie_avg_rating}) aligns closely with your calibrated taste profile.`
                  )}
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                {imdbUrl ? (
                  <a
                    href={imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.4)', gap: '0.5rem' }}
                  >
                    <span>View on IMDb</span>
                    <ExternalLink size={15} />
                  </a>
                ) : <div />}

                <button
                  onClick={onClose}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
