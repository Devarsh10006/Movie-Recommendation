import { useState, useEffect, useCallback } from 'react';
import { getRecommendations, predictMovie, getHealth } from '../services/api';

export function useRecommendations() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [rating, setRating] = useState(8);
  const [genreFilter, setGenreFilter] = useState('');
  const [topN, setTopN] = useState(8);

  const [recommendations, setRecommendations] = useState([]);
  const [sourceMovie, setSourceMovie] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [backendHealth, setBackendHealth] = useState(null);
  const [isBackendReady, setIsBackendReady] = useState(false);

  // Check health on initial mount
  const checkBackendHealth = useCallback(async () => {
    try {
      const data = await getHealth();
      setBackendHealth(data);
      setIsBackendReady(data.status === 'healthy' && data.model_loaded);
    } catch {
      setIsBackendReady(false);
      setBackendHealth({ status: 'offline', model_loaded: false });
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // 30s heartbeat
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  const generateRecommendations = async (overrideParams = {}) => {
    const movie = overrideParams.movie !== undefined ? overrideParams.movie : selectedMovie;
    const movieName = overrideParams.movie_name || overrideParams.query || (typeof movie === 'string' ? movie : movie?.title);
    const currentRating = overrideParams.rating !== undefined ? overrideParams.rating : rating;
    const filter = overrideParams.genreFilter !== undefined ? overrideParams.genreFilter : genreFilter;
    const count = overrideParams.topN || topN;

    if (!movie && !movieName) {
      setError('Please choose a movie you watched to receive personalized recommendations.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      user_id: 1,
      top_n: count,
      user_rating: currentRating,
      genre_filter: filter && filter !== 'All' ? filter : null,
      movie_id: (movie && typeof movie === 'object' && movie.movie_id) ? Number(movie.movie_id) : null,
      movie_name: (movie && typeof movie === 'object' ? movie.title : null) || movieName || null
    };

    try {
      // Run recommendation generation and user movie preference prediction in parallel
      const [recData, predData] = await Promise.all([
        getRecommendations(payload),
        predictMovie({
          user_id: 1,
          movie_id: payload.movie_id,
          movie_name: payload.movie_name,
          user_rating: currentRating
        }).catch(err => {
          console.warn('[PREDICT WARN]', err);
          return null;
        })
      ]);

      setRecommendations(recData.recommendations || []);
      const resolvedSource = recData.source_movie || movie;
      setSourceMovie(resolvedSource);
      if (resolvedSource && (!selectedMovie || typeof selectedMovie === 'string')) {
        setSelectedMovie(resolvedSource);
      }
      setPrediction(predData);

      if (!recData.recommendations || recData.recommendations.length === 0) {
        setError("We couldn't find suitable recommendations for this specific input. Try another movie or adjust your genre filter.");
      }
    } catch (err) {
      console.error('[RECOMMEND ERROR]', err);
      setError(
        err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
          ? "We couldn't connect to the CineMatch AI recommendation engine. Please ensure the FastAPI backend is running on http://localhost:8000."
          : (err.message || 'An unexpected error occurred while generating recommendations. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  const resetRecommendations = () => {
    setRecommendations([]);
    setPrediction(null);
    setSourceMovie(null);
    setError(null);
  };

  return {
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
    setError,
    backendHealth,
    isBackendReady,
    checkBackendHealth,
    generateRecommendations,
    resetRecommendations
  };
}
