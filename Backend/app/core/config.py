import os
from pathlib import Path
from typing import List
from pydantic import BaseModel, Field

# Base Directory: Backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    # Application Info
    APP_NAME: str = "Movie Recommendation & Rating Prediction API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = (
        "Enterprise-grade Machine Learning backend providing real-time movie "
        "recommendations, rating predictions, and catalog analytics trained on "
        "the MovieLens dataset."
    )
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Directory & File Paths
    BASE_DIR: Path = BASE_DIR
    DATA_RAW_DIR: Path = BASE_DIR / "CSVs"
    DATA_PROCESSED_DIR: Path = BASE_DIR / "data" / "processed"
    MODELS_DIR: Path = BASE_DIR / "models"
    REPORTS_DIR: Path = BASE_DIR / "reports"
    FIGURES_DIR: Path = BASE_DIR / "reports" / "figures"
    
    # Key Artifact Paths
    LOOKUP_TABLES_PATH: Path = BASE_DIR / "models" / "lookup_tables.joblib"
    MODEL_TUNED_PATH: Path = BASE_DIR / "models" / "random_forest_tuned.joblib"
    MODEL_BASELINE_PATH: Path = BASE_DIR / "models" / "logistic_regression_lib.joblib"
    SCALER_PATH: Path = BASE_DIR / "models" / "scaler.joblib"
    METRICS_PATH: Path = BASE_DIR / "reports" / "metrics.json"
    
    # ML & Recommendation Engine Parameters
    DEFAULT_TOP_N: int = 10
    MAX_TOP_N: int = 50
    DEFAULT_LIKE_THRESHOLD: float = 4.0
    PROBABILITY_LIKE_THRESHOLD: float = 0.50

settings = Settings()
