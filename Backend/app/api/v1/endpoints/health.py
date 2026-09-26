from fastapi import APIRouter, Depends
from app.models.schemas import HealthResponse
from app.services.recommender import RecommenderService, get_recommender_service
from app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse, summary="System Health & Model Readiness")
async def get_health(service: RecommenderService = Depends(get_recommender_service)):
    """Check API server health, model artifacts status, and catalog vocabulary sizes."""
    status_str = "healthy" if service.is_ready else "degraded"
    return HealthResponse(
        status=status_str,
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        model_loaded=service.is_ready,
        model_name="RandomForestClassifier (Tuned - 100 Estimators)",
        vocabulary_sizes={
            "users": len(service.user_avgs),
            "dense_movies": len(service.movie_avgs),
            "catalog_movies": len(service.movie_meta),
            "imdb_links": len(service.movie_links)
        },
        global_avg_rating=round(service.global_avg, 2)
    )
