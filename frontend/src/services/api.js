/**
 * CineMatch AI - REST API Service Layer
 * Communicates with the FastAPI backend
 */

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const FALLBACK_BASE_URL = 'http://127.0.0.1:8000';

export const FALLBACK_TOP_MOVIES = [
  { movie_id: 318, title: "Shawshank Redemption, The (1994)", clean_title: "The Shawshank Redemption", year: "1994", genres: ["Crime", "Drama"], movie_avg_rating: 4.43, imdb_id: "0111161" },
  { movie_id: 858, title: "Godfather, The (1972)", clean_title: "The Godfather", year: "1972", genres: ["Crime", "Drama"], movie_avg_rating: 4.35, imdb_id: "0068646" },
  { movie_id: 79132, title: "Inception (2010)", clean_title: "Inception", year: "2010", genres: ["Action", "Sci-Fi", "Thriller"], movie_avg_rating: 4.15, imdb_id: "1375666" },
  { movie_id: 58559, title: "Dark Knight, The (2008)", clean_title: "The Dark Knight", year: "2008", genres: ["Action", "Crime", "Drama"], movie_avg_rating: 4.14, imdb_id: "0468569" },
  { movie_id: 109487, title: "Interstellar (2014)", clean_title: "Interstellar", year: "2014", genres: ["Sci-Fi", "Adventure", "Drama"], movie_avg_rating: 4.11, imdb_id: "0816692" },
  { movie_id: 2571, title: "Matrix, The (1999)", clean_title: "The Matrix", year: "1999", genres: ["Action", "Sci-Fi"], movie_avg_rating: 4.15, imdb_id: "0133093" },
  { movie_id: 296, title: "Pulp Fiction (1994)", clean_title: "Pulp Fiction", year: "1994", genres: ["Comedy", "Crime", "Drama"], movie_avg_rating: 4.20, imdb_id: "0110912" },
  { movie_id: 2959, title: "Fight Club (1999)", clean_title: "Fight Club", year: "1999", genres: ["Action", "Drama", "Thriller"], movie_avg_rating: 4.22, imdb_id: "0137523" },
  { movie_id: 1, title: "Toy Story (1995)", clean_title: "Toy Story", year: "1995", genres: ["Adventure", "Animation", "Children", "Comedy"], movie_avg_rating: 3.88, imdb_id: "0114709" },
  { movie_id: 5618, title: "Spirited Away (2001)", clean_title: "Spirited Away", year: "2001", genres: ["Animation", "Adventure", "Fantasy"], movie_avg_rating: 4.20, imdb_id: "0245429" },
  { movie_id: 1196, title: "Star Wars: Episode V - The Empire Strikes Back (1980)", clean_title: "The Empire Strikes Back", year: "1980", genres: ["Action", "Adventure", "Sci-Fi"], movie_avg_rating: 4.18, imdb_id: "0080684" },
  { movie_id: 1203, title: "12 Angry Men (1957)", clean_title: "12 Angry Men", year: "1957", genres: ["Drama"], movie_avg_rating: 4.26, imdb_id: "0050083" },
  { movie_id: 112552, title: "Whiplash (2014)", clean_title: "Whiplash", year: "2014", genres: ["Drama"], movie_avg_rating: 4.17, imdb_id: "2582802" },
  { movie_id: 4993, title: "Lord of the Rings: The Fellowship of the Ring, The (2001)", clean_title: "The Lord of the Rings: The Fellowship of the Ring", year: "2001", genres: ["Adventure", "Fantasy"], movie_avg_rating: 4.12, imdb_id: "0120737" },
  { movie_id: 1210, title: "Star Wars: Episode VI - Return of the Jedi (1983)", clean_title: "Return of the Jedi", year: "1983", genres: ["Action", "Adventure", "Sci-Fi"], movie_avg_rating: 4.02, imdb_id: "0086190" }
];

// Memory cache for movie queries to make typing instantaneous
const searchCache = new Map();

async function fetchWithFallback(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return res;
  } catch (err) {
    if (API_BASE_URL.includes('localhost')) {
      try {
        const fallbackRes = await fetch(`${FALLBACK_BASE_URL}${endpoint}`, options);
        // If successful, stick to 127.0.0.1
        API_BASE_URL = FALLBACK_BASE_URL;
        return fallbackRes;
      } catch {
        throw err;
      }
    }
    throw err;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

/**
 * Health check to verify backend & model readiness
 */
export async function getHealth() {
  const response = await fetchWithFallback('/health', {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
}

/**
 * Fetch trained machine learning model metadata & evaluation metrics
 */
export async function getModelInfo() {
  const response = await fetchWithFallback('/model-info', {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
}

/**
 * Fetch MovieLens 25M dataset statistics and distribution insights
 */
export async function getDataInsights() {
  const response = await fetchWithFallback('/data-insights', {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
}

/**
 * Search movies from catalog with instant query matching & caching
 * @param {string} query
 * @param {number} limit
 */
export async function searchMovies(query = '', limit = 20) {
  const cleanQ = (query || '').trim();
  const cacheKey = `${cleanQ.toLowerCase()}_${limit}`;

  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  try {
    const url = `/movies/search?query=${encodeURIComponent(cleanQ)}&limit=${limit}`;
    const response = await fetchWithFallback(url, {
      headers: { 'Accept': 'application/json' }
    });
    const data = await handleResponse(response);
    if (data && data.results) {
      searchCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn('[SEARCH WARN] Falling back to local catalog for query:', query, err);
  }

  // Fallback filtering if backend connection isn't ready
  let filtered = FALLBACK_TOP_MOVIES;
  if (cleanQ) {
    const qLower = cleanQ.toLowerCase();
    filtered = FALLBACK_TOP_MOVIES.filter(m =>
      m.clean_title.toLowerCase().includes(qLower) ||
      m.title.toLowerCase().includes(qLower) ||
      m.genres.some(g => g.toLowerCase().includes(qLower))
    );
  }
  const fallbackResult = {
    query: cleanQ,
    results_count: filtered.length,
    results: filtered
  };
  return fallbackResult;
}

/**
 * Fetch single movie detailed overview and rationale
 * @param {number} movieId
 */
export async function getMovieDetails(movieId) {
  const response = await fetchWithFallback(`/api/movies/${movieId}`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(response);
}

/**
 * Predict user satisfaction probability using Tuned Random Forest
 * @param {Object} data { user_id, movie_id, movie_name, user_rating }
 */
export async function predictMovie(data) {
  const response = await fetchWithFallback('/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

/**
 * Generate personalized Top-N recommendations from ML model
 * @param {Object} data { user_id, top_n, genre_filter, movie_id, movie_name, user_rating }
 */
export async function getRecommendations(data) {
  const response = await fetchWithFallback('/recommend', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

export { API_BASE_URL };
