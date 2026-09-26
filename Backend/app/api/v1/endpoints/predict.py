from fastapi import APIRouter, Depends
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.recommender import RecommenderService, get_recommender_service

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse, summary="Predict Movie Liking")
async def predict_movie(
    payload: PredictionRequest,
    service: RecommenderService = Depends(get_recommender_service)
):
    """Predict whether a user will like a specific movie.
    
    Uses historical collaborative interaction signals transformed into feature vector
    `[user_avg_rating, movie_avg_rating]` evaluated by the Tuned Random Forest Classifier.
    """
    res = service.predict_like(
        user_id=payload.user_id or 1,
        movie_id=payload.movie_id,
        movie_name=payload.movie_name,
        user_rating=payload.user_rating
    )
    return PredictionResponse(**res)
