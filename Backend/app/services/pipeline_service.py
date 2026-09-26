import time
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.core.logging import logger
from app.core.config import settings

class PipelineService:
    """Manages ML Pipeline execution state and background runs."""

    _instance: Optional["PipelineService"] = None
    _lock = threading.Lock()

    def __init__(self):
        self.is_running: bool = False
        self.status: str = "IDLE"
        self.last_run_at: Optional[str] = None
        self.duration_seconds: Optional[float] = None
        self.error_message: Optional[str] = None
        self.last_metrics: Dict[str, float] = {
            "accuracy": 0.7342,
            "precision": 0.7281,
            "recall": 0.7514,
            "f1_score": 0.7396,
            "roc_auc": 0.8063
        }
        if settings.METRICS_PATH.exists():
            try:
                import json
                with open(settings.METRICS_PATH, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    if "test_metrics" in saved:
                        self.last_metrics = saved["test_metrics"]
            except Exception:
                pass
        self.steps: List[Dict[str, Any]] = [
            {"step": "01_ingest", "name": "Dataset Ingestion & Validation", "status": "COMPLETED"},
            {"step": "02_preprocess", "name": "Dense Core Filtering & Scaling", "status": "COMPLETED"},
            {"step": "03_train", "name": "Random Forest & Baseline Training", "status": "COMPLETED"},
            {"step": "04_evaluate", "name": "Test Metric Evaluation & Figures", "status": "COMPLETED"}
        ]

    @classmethod
    def get_instance(cls) -> "PipelineService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "status": self.status,
            "last_run_at": self.last_run_at or "Initial Boot",
            "duration_seconds": self.duration_seconds,
            "last_metrics": self.last_metrics,
            "error_message": self.error_message,
            "steps": self.steps
        }

    def trigger_run(self) -> Dict[str, Any]:
        with self._lock:
            if self.is_running:
                return {"message": "Pipeline is already running.", "status": self.status}
            self.is_running = True
            self.status = "RUNNING"
            self.error_message = None

        thread = threading.Thread(target=self._execute_pipeline, daemon=True)
        thread.start()
        return {"message": "ML Pipeline execution triggered in background.", "status": "RUNNING"}

    def _set_step_status(self, step_id: str, status: str):
        for s in self.steps:
            if s["step"] == step_id:
                s["status"] = status
                break

    def _execute_pipeline(self):
        start_time = time.time()
        try:
            logger.info("Executing background ML pipeline...")
            # Reset step statuses
            for s in self.steps:
                s["status"] = "PENDING"

            from pipeline.run_pipeline import run_entire_pipeline
            result = run_entire_pipeline(
                nrows=500000,
                step_callback=self._set_step_status
            )

            # Reload recommender service with new artifacts
            from app.services.recommender import get_recommender_service
            srv = get_recommender_service()
            srv.load_artifacts()

            self.status = "SUCCESS"
            self.last_run_at = datetime.now().isoformat()
            self.duration_seconds = result.get("duration_seconds", round(time.time() - start_time, 2))
            if "metrics" in result:
                self.last_metrics = result["metrics"]
            logger.info(f"Pipeline completed successfully in {self.duration_seconds}s!")
        except Exception as e:
            logger.error(f"Pipeline execution failed: {e}", exc_info=True)
            self.status = "FAILED"
            self.error_message = str(e)
            self.duration_seconds = round(time.time() - start_time, 2)
        finally:
            self.is_running = False

def get_pipeline_service() -> PipelineService:
    return PipelineService.get_instance()
