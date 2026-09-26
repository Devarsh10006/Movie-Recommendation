"""Machine Learning Pipeline package for Movie Recommendation & Rating Prediction System."""

from pipeline.ingest import ingest_data, validate_raw_data
from pipeline.preprocess import preprocess_and_split
from pipeline.train import train_models
from pipeline.evaluate import evaluate_models
from pipeline.run_pipeline import run_entire_pipeline

__all__ = [
    "ingest_data",
    "validate_raw_data",
    "preprocess_and_split",
    "train_models",
    "evaluate_models",
    "run_entire_pipeline"
]
