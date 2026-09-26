from typing import List
from fastapi import APIRouter, Depends, Query, Path
from app.models.schemas import (
    MovieSearchResponse,
    MovieDetailsResponse,
    MovieItem,
    GenreInfo
)
from app.services.recommender import RecommenderService, get_recommender_service

router = APIRouter()

@router.get("/movies/search", response_model=MovieSearchResponse, summary="Search Movies by Title")
async def search_movies(
    query: str = Query("", description="Movie title search query"),
    limit: int = Query(20, ge=1, le=50, description="Max results to return"),
    service: RecommenderService = Depends(get_recommender_service)
):
    """Search movies with relevance scoring, fuzzy clean title matching, and popularity weighting."""
    matches = service.search_movies(query=query, limit=limit)
    return MovieSearchResponse(
        query=query,
        results_count=len(matches),
        results=matches
    )

@router.get("/movies/top", response_model=List[MovieItem], summary="Get Top Rated Catalog Movies")
async def get_top_movies(
    limit: int = Query(15, ge=1, le=50, description="Number of top movies to retrieve"),
    service: RecommenderService = Depends(get_recommender_service)
):
    """Retrieve top-rated movies with highest historical audience satisfaction."""
    return service.search_movies(query="", limit=limit)

@router.get("/movies/{movie_id}", response_model=MovieDetailsResponse, summary="Get Movie Details")
async def get_movie_details(
    movie_id: int = Path(..., ge=1, description="MovieLens Movie ID"),
    service: RecommenderService = Depends(get_recommender_service)
):
    """Get rich metadata, genres, average rating, IMDb links, and AI overview for a specific movie."""
    return service.get_movie_details(movie_id)

@router.get("/genres", response_model=List[GenreInfo], summary="Get All Catalog Genres")
async def get_genres(
    service: RecommenderService = Depends(get_recommender_service)
):
    """Get a list of all distinct genres along with their title frequency in the dataset."""
    return service.get_genres()
