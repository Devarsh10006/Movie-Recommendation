from fastapi import APIRouter, Depends
from app.models.schemas import RecommendationRequest, RecommendationResponse
from app.services.recommender import RecommenderService, get_recommender_service

router = APIRouter()

@router.post("/recommend", response_model=RecommendationResponse, summary="Generate Top-N Recommendations")
async def recommend_movies(
    payload: RecommendationRequest,
    service: RecommenderService = Depends(get_recommender_service)
):
    """Generate high-speed Top-N ranked movie recommendations.
    
    Supports:
    - User personalized taste profiling via `user_id` or custom `user_rating`.
    - Content genre filtering via `genre_filter`.
    - Seed-movie recommendations (e.g. "movies similar to Inception") via `movie_id` or `movie_name`.
    """
    res = service.recommend_top_n(
        user_id=payload.user_id or 1,
        top_n=payload.top_n or 10,
        genre_filter=payload.genre_filter,
        user_rating=payload.user_rating,
        movie_id=payload.movie_id,
        movie_name=payload.movie_name
    )
    return RecommendationResponse(**res)
