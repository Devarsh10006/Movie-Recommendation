import React from 'react';
import { Star, ExternalLink, Info, Film, Sparkles } from 'lucide-react';

const GENRE_GRADIENTS = {
  Action: 'linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 100%)',
  Adventure: 'linear-gradient(135deg, #14532d 0%, #1e1b4b 100%)',
  Animation: 'linear-gradient(135deg, #831843 0%, #312e81 100%)',
  Comedy: 'linear-gradient(135deg, #713f12 0%, #31104b 100%)',
  Crime: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
  Drama: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
  Fantasy: 'linear-gradient(135deg, #581c87 0%, #1e1b4b 100%)',
  Horror: 'linear-gradient(135deg, #450a0a 0%, #09090b 100%)',
  Mystery: 'linear-gradient(135deg, #134e4a 0%, #111827 100%)',
  Romance: 'linear-gradient(135deg, #831843 0%, #4c0519 100%)',
  'Sci-Fi': 'linear-gradient(135deg, #1e1b4b 0%, #0369a1 100%)',
  Thriller: 'linear-gradient(135deg, #3b0764 0%, #18181b 100%)'
};

export default function RecommendationCard({ movie, onViewDetails }) {
  const genresArray = Array.isArray(movie.genres_list)
    ? movie.genres_list
    : (Array.isArray(movie.genres)
      ? movie.genres
      : (typeof movie.genres === 'string' ? movie.genres.split('|').filter(Boolean) : []));

  const matchPct = movie.match_score_pct || Math.round((movie.predicted_probability || 0.8) * 100);
  const primaryGenre = genresArray[0] || 'Drama';
  const cardGradient = GENRE_GRADIENTS[primaryGenre] || 'linear-gradient(135deg, #1e1035 0%, #111827 100%)';

  const imdbUrl = movie.imdb_id ? `https://www.imdb.com/title/tt${movie.imdb_id}/` : null;

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(16, 16, 28, 0.85)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(139, 92, 246, 0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Cinematic Poster Header */}
      <div
        style={{
          height: '180px',
          background: cardGradient,
          position: 'relative',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        />

        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}
          >
            <Sparkles size={12} />
            <span>{matchPct}% Match</span>
          </span>

          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Star size={13} fill="#fbbf24" color="#fbbf24" />
            <span>{movie.movie_avg_rating}</span>
          </span>
        </div>

        {/* Bottom Poster Overlay */}
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 600 }}>
            <Film size={13} />
            <span>{primaryGenre}</span>
            {movie.year && movie.year !== 'N/A' && <span>• {movie.year}</span>}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h4
            title={movie.title}
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-highlight)',
              lineHeight: 1.3,
              marginBottom: '0.625rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.8rem'
            }}
          >
            {movie.clean_title || movie.title}
          </h4>

          {/* Genre chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {genresArray.slice(0, 3).map((g, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-secondary)'
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ paddingTop: '0.875rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.625rem' }}>
          <button
            onClick={() => onViewDetails(movie)}
            className="btn-secondary"
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-sm)',
              justifyContent: 'center'
            }}
          >
            <Info size={15} />
            <span>Details</span>
          </button>

          {imdbUrl && (
            <a
              href={imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              title="Open IMDb page in new tab"
              style={{
                padding: '0.55rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                color: '#fbbf24',
                borderColor: 'rgba(251, 191, 36, 0.3)'
              }}
            >
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
