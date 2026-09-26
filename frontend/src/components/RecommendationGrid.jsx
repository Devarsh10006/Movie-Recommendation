import React, { useState } from 'react';
import { Sparkles, SlidersHorizontal, Film } from 'lucide-react';
import RecommendationCard from './RecommendationCard';

const GENRE_FILTERS = [
  'All',
  'Action',
  'Crime',
  'Drama',
  'Sci-Fi',
  'Adventure',
  'Thriller',
  'Comedy',
  'Animation',
  'Mystery'
];

export default function RecommendationGrid({
  recommendations,
  sourceMovie,
  genreFilter,
  onSelectGenreFilter,
  topN,
  onChangeTopN,
  onViewDetails
}) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section id="recommendations-results" className="animate-fade-in" style={{ marginTop: '3.5rem', marginBottom: '4rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-purple">
              <Sparkles size={14} />
              Personalized Results
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ({recommendations.length} recommendations generated)
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800 }}>
            Recommended <span className="gradient-text">For You</span>
          </h2>
          {sourceMovie && (
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Optimized for your taste profile based on your rating of{' '}
              <strong style={{ color: 'var(--text-highlight)' }}>
                {sourceMovie.clean_title || sourceMovie.title}
              </strong>
              {sourceMovie.user_rating && ` (★ ${sourceMovie.user_rating} / 10)`}.
            </p>
          )}
        </div>

        {/* Count Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <SlidersHorizontal size={14} /> Show:
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
            {[4, 8, 12, 16].map((cnt) => (
              <button
                key={cnt}
                onClick={() => onChangeTopN(cnt)}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  background: topN === cnt ? 'var(--accent-purple)' : 'transparent',
                  color: topN === cnt ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '2rem'
        }}
      >
        {GENRE_FILTERS.map((g) => {
          const isActive = (genreFilter === g) || (!genreFilter && g === 'All');
          return (
            <button
              key={g}
              onClick={() => onSelectGenreFilter(g === 'All' ? '' : g)}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isActive ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isActive ? 'transparent' : 'var(--border-subtle)'}`,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: isActive ? '0 0 15px rgba(139, 92, 246, 0.4)' : 'none'
              }}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Responsive Movie Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.75rem'
        }}
      >
        {recommendations.map((movie) => (
          <RecommendationCard
            key={movie.movie_id}
            movie={movie}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </section>
  );
}
