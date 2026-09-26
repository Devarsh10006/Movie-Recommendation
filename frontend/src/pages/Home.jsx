import React, { useRef, useState } from 'react';
import { Sparkles, Film, ArrowRight, RotateCcw } from 'lucide-react';
import Hero from '../components/Hero';
import MovieSelector from '../components/MovieSelector';
import RatingInput from '../components/RatingInput';
import PredictCard from '../components/PredictCard';
import RecommendationGrid from '../components/RecommendationGrid';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import HowItWorks from '../components/HowItWorks';

export default function Home({
  selectedMovie,
  setSelectedMovie,
  rating,
  setRating,
  genreFilter,
  setGenreFilter,
  topN,
  setTopN,
  recommendations,
  sourceMovie,
  prediction,
  loading,
  error,
  generateRecommendations,
  resetRecommendations,
  onViewDetails,
  onOpenModelInfo,
  onOpenInsights
}) {
  const formRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (selectedMovie) {
      generateRecommendations();
    } else if (searchQuery && searchQuery.trim()) {
      generateRecommendations({ movie_name: searchQuery.trim() });
    } else {
      generateRecommendations();
    }
  };

  const handleAutoSubmit = (movieOrName) => {
    if (typeof movieOrName === 'string') {
      setSearchQuery(movieOrName);
      generateRecommendations({ movie_name: movieOrName });
    } else if (movieOrName) {
      setSelectedMovie(movieOrName);
      setSearchQuery('');
      generateRecommendations({ movie: movieOrName });
    }
  };

  return (
    <main>
      {/* 1. Hero Section */}
      <Hero
        onGetStarted={scrollToForm}
        onExploreHowItWorks={scrollToHowItWorks}
      />

      {/* 2. Recommendation Form Section */}
      <section id="recommend-section" ref={formRef} style={{ padding: '3.5rem 0', position: 'relative' }}>
        <div className="container">
          {/* Section Title */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>
              Instant AI Personalization
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800 }}>
              What Did You <span className="gradient-text">Watch?</span>
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.75rem auto 0' }}>
              Give us one movie you experienced and your honest rating. Our ML classifier will map your taste signature and find similar favorites.
            </p>
          </div>

          {/* Recommendation Input Form Card */}
          <div
            className="glass-panel"
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              padding: '2.5rem',
              background: 'rgba(16, 16, 28, 0.85)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.12)'
            }}
          >
            <form onSubmit={handleSubmit}>
              {/* Step 1: Movie Selection */}
              <MovieSelector
                selectedMovie={selectedMovie}
                onSelectMovie={setSelectedMovie}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onAutoSubmit={handleAutoSubmit}
              />

              {/* Step 2: Rating Input */}
              <RatingInput
                rating={rating}
                onChangeRating={setRating}
              />

              {/* Step 3: Genre Information / Optional Preference */}
              {selectedMovie && (selectedMovie.genres_list || selectedMovie.genres) && (
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Detected Movie Themes & Genres:
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(Array.isArray(selectedMovie.genres_list)
                      ? selectedMovie.genres_list
                      : (Array.isArray(selectedMovie.genres)
                        ? selectedMovie.genres
                        : (typeof selectedMovie.genres === 'string' ? selectedMovie.genres.split('|') : []))).map((g, idx) => (
                      <span key={idx} className="badge badge-purple" style={{ fontSize: '0.8rem' }}>
                        {typeof g === 'string' ? g : g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Submit Button */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '1.1rem 2rem',
                    fontSize: '1.05rem',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Sparkles size={20} />
                  <span>{loading ? 'Finding Movies You\'ll Love...' : '✨ Recommend Movies'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>

                {recommendations && recommendations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      resetRecommendations();
                    }}
                    className="btn-secondary"
                    style={{ padding: '1rem 1.5rem', fontSize: '0.95rem' }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Dynamic States Display */}
          {error && (
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <ErrorMessage error={error} onRetry={generateRecommendations} />
            </div>
          )}

          {loading && (
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <LoadingState />
            </div>
          )}

          {/* AI Like/Dislike Prediction for the Chosen Movie */}
          {!loading && prediction && (
            <div style={{ maxWidth: '820px', margin: '2.5rem auto 0' }}>
              <PredictCard prediction={prediction} />
            </div>
          )}

          {/* Recommended Movies Grid */}
          {!loading && recommendations && recommendations.length > 0 && (
            <RecommendationGrid
              recommendations={recommendations}
              sourceMovie={sourceMovie}
              genreFilter={genreFilter}
              onSelectGenreFilter={(g) => {
                setGenreFilter(g);
                generateRecommendations({ genreFilter: g });
              }}
              topN={topN}
              onChangeTopN={(n) => {
                setTopN(n);
                generateRecommendations({ topN: n });
              }}
              onViewDetails={onViewDetails}
            />
          )}

          {/* Empty State before any submission */}
          {!loading && (!recommendations || recommendations.length === 0) && !error && (
            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
              <EmptyState onScrollToForm={scrollToForm} />
            </div>
          )}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <div className="container">
        <HowItWorks />
      </div>
    </main>
  );
}
