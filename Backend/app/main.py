import sys
from pathlib import Path

# Ensure parent directory (Backend root) is in Python path for direct script execution
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import (
    ModelNotReadyException,
    MovieNotFoundException,
    model_not_ready_exception_handler,
    movie_not_found_exception_handler
)
from app.services.recommender import get_recommender_service
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for application startup and shutdown events."""
    logger.info("Initializing Movie Recommender System Backend...")
    # Preload ML models & lookup tables on startup
    srv = get_recommender_service()
    if srv.is_ready:
        logger.info("Machine Learning inference engine is fully operational!")
    else:
        logger.warning("Artifacts missing or uninitialized. Running in fallback mode.")
    yield
    logger.info("Shutting down Movie Recommender System Backend.")

# Initialize FastAPI Application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Custom Exception Handlers
app.add_exception_handler(ModelNotReadyException, model_not_ready_exception_handler)
app.add_exception_handler(MovieNotFoundException, movie_not_found_exception_handler)

# Mount Static Files for Evaluation Figures if directory exists
figures_dir = settings.FIGURES_DIR
if figures_dir.exists():
    app.mount("/reports/figures", StaticFiles(directory=str(figures_dir)), name="figures")

# Include Versioned API Router (/api/v1)
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Also include router without prefix for easy backwards compatibility
app.include_router(api_router)

@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint providing service overview and documentation links."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_schema": "/openapi.json"
        },
        "endpoints": {
            "health": f"{settings.API_V1_PREFIX}/health",
            "search_movies": f"{settings.API_V1_PREFIX}/movies/search?query=Toy+Story",
            "top_movies": f"{settings.API_V1_PREFIX}/movies/top",
            "movie_details": f"{settings.API_V1_PREFIX}/movies/1",
            "genres": f"{settings.API_V1_PREFIX}/genres",
            "predict": f"{settings.API_V1_PREFIX}/predict",
            "recommend": f"{settings.API_V1_PREFIX}/recommend",
            "analytics_insights": f"{settings.API_V1_PREFIX}/analytics/insights",
            "model_performance": f"{settings.API_V1_PREFIX}/analytics/model-performance",
            "pipeline_status": f"{settings.API_V1_PREFIX}/pipeline/status"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
