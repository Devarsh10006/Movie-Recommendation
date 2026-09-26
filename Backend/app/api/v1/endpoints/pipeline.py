from fastapi import APIRouter, Depends
from app.models.schemas import PipelineStatusResponse
from app.services.pipeline_service import PipelineService, get_pipeline_service

router = APIRouter()

@router.get("/pipeline/status", response_model=PipelineStatusResponse, summary="Get ML Pipeline Status")
async def get_pipeline_status(service: PipelineService = Depends(get_pipeline_service)):
    """Check the execution status of data ingestion, preprocessing, training, and evaluation steps."""
    return service.get_status()

@router.post("/pipeline/run", summary="Trigger ML Pipeline Execution")
async def trigger_pipeline_run(service: PipelineService = Depends(get_pipeline_service)):
    """Trigger the end-to-end Machine Learning pipeline asynchronously."""
    return service.trigger_run()
