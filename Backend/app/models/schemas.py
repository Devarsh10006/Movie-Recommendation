from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Common Movie Schemas ---

class MovieItem(BaseModel):
    movie_id: int = Field(..., description="Unique Movie ID from MovieLens catalog")
    title: str = Field(..., description="Raw movie title with year")
    clean_title: str = Field(..., description="Sanitized movie title without year")
    year: Optional[int] = Field(None, description="Release year extracted from title")
    genres: List[str] = Field(default_factory=list, description="List of genres")
    movie_avg_rating: float = Field(..., description="Historical average rating (0.5 to 5.0 stars)")
    imdb_id: Optional[str] = Field(None, description="IMDb title identifier")
    imdb_url: Optional[str] = Field(None, description="Direct URL to IMDb page")
    is_dense_catalog: bool = Field(True, description="Whether movie is in dense core model vocabulary")

class MovieSearchResponse(BaseModel):
    query: str = Field(..., description="Original search string")
    results_count: int = Field(..., description="Number of results found")
    results: List[MovieItem] = Field(default_factory=list, description="Matched movies list")

class MovieDetailsResponse(BaseModel):
    movie_id: int
    title: str
    clean_title: str
    year: Optional[int]
    genres: List[str]
    movie_avg_rating: float
    imdb_id: Optional[str]
    imdb_url: Optional[str]
    overview: str
    recommendation_explanation: str

# --- Inference Schemas ---

class PredictionRequest(BaseModel):
    user_id: Optional[int] = Field(1, description="Target User ID for personalized rating baseline")
    movie_id: Optional[int] = Field(None, description="Movie ID to predict liking for")
    movie_name: Optional[str] = Field(None, description="Movie Title if ID is unknown (fuzzy matched)")
    user_rating: Optional[float] = Field(
        None,
        ge=0.5,
        le=10.0,
        description="Optional custom user rating baseline (0.5-5.0 scale; values >5 auto-converted to 1-5)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": 1,
                "movie_name": "Toy Story (1995)",
                "user_rating": 4.5
            }
        }
    }

class PredictionResponse(BaseModel):
    user_id: int
    movie_id: int
    movie_title: str
    clean_title: str
    year: Optional[int]
    imdb_id: Optional[str]
    imdb_url: Optional[str]
    genres: List[str]
    is_liked: bool = Field(..., description="Binary classification: 1 if Liked (>=4.0), 0 otherwise")
    confidence: float = Field(..., description="Model predicted probability of liking (0.0 to 1.0)")
    match_score_pct: int = Field(..., description="Match percentage score (0% to 100%)")
    user_avg_rating: float = Field(..., description="User baseline feature value used by model")
    movie_avg_rating: float = Field(..., description="Movie historical average feature value used by model")
    recommendation_verdict: str = Field(..., description="Human-readable decision message")

class RecommendationRequest(BaseModel):
    user_id: Optional[int] = Field(1, description="Target user ID")
    top_n: Optional[int] = Field(10, ge=1, le=50, description="Number of recommendations to return")
    genre_filter: Optional[str] = Field(None, description="Filter by genre (e.g. Action, Comedy, Sci-Fi)")
    user_rating: Optional[float] = Field(None, ge=0.5, le=10.0, description="Optional baseline rating profile")
    movie_id: Optional[int] = Field(None, description="Seed movie ID to guide recommendations")
    movie_name: Optional[str] = Field(None, description="Seed movie title if ID unknown")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": 1,
                "top_n": 5,
                "genre_filter": "Sci-Fi",
                "movie_name": "Inception"
            }
        }
    }

class RecommendationItem(BaseModel):
    rank: int = Field(..., description="Rank in top-N list (1 to N)")
    movie_id: int
    title: str
    clean_title: str
    year: Optional[int]
    genres: List[str]
    predicted_probability: float
    match_score_pct: int
    movie_avg_rating: float
    recommendation: str
    imdb_id: Optional[str]
    imdb_url: Optional[str]

class RecommendationResponse(BaseModel):
    user_id: int
    user_avg_rating: float
    total_recommendations: int
    recommendations: List[RecommendationItem]
    source_movie: Optional[Dict[str, Any]] = None
    genre_filter: Optional[str] = None

# --- Analytics Schemas ---

class GenreInfo(BaseModel):
    name: str
    count: int

class DataInsightsResponse(BaseModel):
    total_movies: int
    dense_core_movies: int
    total_users: int
    global_avg_rating: float
    genres: List[str]
    top_genres: List[GenreInfo]
    top_rated_movies: List[MovieItem]

class ModelPerformanceResponse(BaseModel):
    model_name: str
    algorithm: str
    training_dataset_size: int
    metrics: Dict[str, float]
    features: List[Dict[str, str]]
    figures: List[Dict[str, str]]

# --- Health & Pipeline Schemas ---

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    model_loaded: bool
    model_name: str
    vocabulary_sizes: Dict[str, int]
    global_avg_rating: float

class PipelineStatusResponse(BaseModel):
    is_running: bool
    status: str
    last_run_at: Optional[str] = None
    duration_seconds: Optional[float] = None
    last_metrics: Optional[Dict[str, float]] = None
    error_message: Optional[str] = None
    steps: List[Dict[str, Any]] = Field(default_factory=list)
