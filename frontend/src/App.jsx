import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import MovieDetailsModal from './components/MovieDetailsModal';
import ModelInfoModal from './components/ModelInfoModal';
import DataInsightsModal from './components/DataInsightsModal';
import { useRecommendations } from './hooks/useRecommendations';

export default function App() {
  const {
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
    backendHealth,
    isBackendReady,
    generateRecommendations,
    resetRecommendations
  } = useRecommendations();

  // Modal dialog states
  const [modalMovie, setModalMovie] = useState(null);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const handleScrollToRecommend = () => {
    const el = document.getElementById('recommend-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <Navbar
        backendHealth={backendHealth}
        isBackendReady={isBackendReady}
        onOpenModelInfo={() => setShowModelInfo(true)}
        onOpenInsights={() => setShowInsights(true)}
        onScrollToRecommend={handleScrollToRecommend}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1 }}>
        <Home
          selectedMovie={selectedMovie}
          setSelectedMovie={setSelectedMovie}
          rating={rating}
          setRating={setRating}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          topN={topN}
          setTopN={setTopN}
          recommendations={recommendations}
          sourceMovie={sourceMovie}
          prediction={prediction}
          loading={loading}
          error={error}
          generateRecommendations={generateRecommendations}
          resetRecommendations={resetRecommendations}
          onViewDetails={(movie) => setModalMovie(movie)}
          onOpenModelInfo={() => setShowModelInfo(true)}
          onOpenInsights={() => setShowInsights(true)}
        />
      </div>

      {/* Footer */}
      <Footer
        isBackendReady={isBackendReady}
        onOpenModelInfo={() => setShowModelInfo(true)}
        onOpenInsights={() => setShowInsights(true)}
      />

      {/* Movie Details Modal */}
      {modalMovie && (
        <MovieDetailsModal
          movie={modalMovie}
          sourceMovie={sourceMovie}
          onClose={() => setModalMovie(null)}
        />
      )}

      {/* ML Model Architecture & Specs Modal */}
      {showModelInfo && (
        <ModelInfoModal
          onClose={() => setShowModelInfo(false)}
        />
      )}

      {/* Dataset & Catalog Insights Modal */}
      {showInsights && (
        <DataInsightsModal
          onClose={() => setShowInsights(false)}
        />
      )}
    </div>
  );
}
