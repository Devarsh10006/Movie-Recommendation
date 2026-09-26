from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger

class ModelNotReadyException(Exception):
    """Raised when an inference call is made before model artifacts are loaded."""
    def __init__(self, message: str = "Machine Learning model service is not yet loaded or ready."):
        self.message = message
        super().__init__(self.message)

class MovieNotFoundException(Exception):
    """Raised when a specified movie is not found in the catalog."""
    def __init__(self, identifier: str):
        self.message = f"Movie '{identifier}' could not be located in the catalog."
        super().__init__(self.message)

class PipelineExecutionException(Exception):
    """Raised when the ML training/preprocessing pipeline encounters an error."""
    def __init__(self, step: str, details: str):
        self.step = step
        self.details = details
        self.message = f"Pipeline execution failed at step '{step}': {details}"
        super().__init__(self.message)

async def model_not_ready_exception_handler(request: Request, exc: ModelNotReadyException):
    logger.warning(f"503 Service Unavailable: {exc.message} [URL: {request.url}]")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": exc.message, "status": "service_unavailable"}
    )

async def movie_not_found_exception_handler(request: Request, exc: MovieNotFoundException):
    logger.info(f"404 Not Found: {exc.message} [URL: {request.url}]")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message, "status": "not_found"}
    )

async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"500 Internal Error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred while processing the request.", "error": str(exc)}
    )
