import os
from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd

from app.core.config import settings
from app.core.logging import logger

def validate_raw_data() -> Dict[str, Any]:
    """Validate that required raw datasets exist in the CSVs directory."""
    raw_dir = settings.DATA_RAW_DIR
    required_files = ["movies.csv", "ratings.csv", "links.csv"]
    status = {}
    
    for filename in required_files:
        filepath = raw_dir / filename
        exists = filepath.exists()
        size_mb = round(filepath.stat().st_size / (1024 * 1024), 2) if exists else 0
        status[filename] = {
            "exists": exists,
            "path": str(filepath),
            "size_mb": size_mb
        }
        if not exists:
            raise FileNotFoundError(f"Required dataset file missing: {filepath}")
            
    logger.info("Raw dataset validation passed successfully.")
    return status

def ingest_data(nrows: int = 1000000) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load and validate raw datasets with memory-efficient types.
    
    Args:
        nrows: Maximum number of ratings rows to read (defaults to 1,000,000 for fast pipeline).
               Pass None to load the complete dataset.
               
    Returns:
        Tuple of (movies_df, ratings_df, links_df)
    """
    validate_raw_data()
    
    raw_dir = settings.DATA_RAW_DIR
    movies_path = raw_dir / "movies.csv"
    ratings_path = raw_dir / "ratings.csv"
    links_path = raw_dir / "links.csv"
    
    logger.info(f"Ingesting movies catalog from {movies_path}...")
    movies_df = pd.read_csv(movies_path, dtype={"movieId": "int32", "title": "str", "genres": "str"})
    
    logger.info(f"Ingesting ratings data from {ratings_path} (nrows={nrows})...")
    ratings_df = pd.read_csv(
        ratings_path,
        nrows=nrows,
        dtype={"userId": "int32", "movieId": "int32", "rating": "float32", "timestamp": "int64"}
    )
    
    logger.info(f"Ingesting movie links from {links_path}...")
    links_df = pd.read_csv(
        links_path,
        dtype={"movieId": "int32", "imdbId": "str", "tmdbId": "str"}
    )
    
    logger.info(
        f"Ingestion complete: {len(movies_df):,} movies, "
        f"{len(ratings_df):,} ratings, {len(links_df):,} links."
    )
    return movies_df, ratings_df, links_df
