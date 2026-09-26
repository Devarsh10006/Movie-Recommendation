from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    movies,
    predict,
    recommend,
    analytics,
    pipeline
)

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health.router, tags=["System Health"])
api_router.include_router(movies.router, tags=["Movies Catalog"])
api_router.include_router(predict.router, tags=["Inference"])
api_router.include_router(recommend.router, tags=["Inference"])
api_router.include_router(analytics.router, tags=["Analytics & Metrics"])
api_router.include_router(pipeline.router, tags=["ML Pipeline"])
