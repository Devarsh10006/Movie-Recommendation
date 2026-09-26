import time
from typing import Callable, Optional, Dict, Any

from app.core.logging import logger
from pipeline.ingest import ingest_data
from pipeline.preprocess import preprocess_and_split
from pipeline.train import train_models
from pipeline.evaluate import evaluate_models

def run_entire_pipeline(
    nrows: int = 1000000,
    step_callback: Optional[Callable[[str, str], None]] = None
) -> Dict[str, Any]:
    """Execute the end-to-end Machine Learning Pipeline.
    
    Args:
        nrows: Maximum ratings rows to ingest (defaults to 1,000,000 for responsive execution).
        step_callback: Optional callback func(step_id, status) where status is
                       'IN_PROGRESS', 'COMPLETED', or 'FAILED'.
                       
    Returns:
        Dictionary containing execution summary, metrics, and duration.
    """
    start_time = time.time()
    logger.info(f"=== Starting Machine Learning Pipeline Execution (nrows={nrows:,}) ===")
    
    def update_step(step_id: str, status: str):
        if step_callback:
            try:
                step_callback(step_id, status)
            except Exception as e:
                logger.warning(f"Error in step_callback for {step_id}: {e}")

    try:
        # Step 1: Ingestion
        update_step("01_ingest", "IN_PROGRESS")
        movies_df, ratings_df, links_df = ingest_data(nrows=nrows)
        update_step("01_ingest", "COMPLETED")
        
        # Step 2: Preprocessing & Feature Engineering
        update_step("02_preprocess", "IN_PROGRESS")
        train_df, test_df, lookup_tables = preprocess_and_split(
            movies_df=movies_df,
            ratings_df=ratings_df,
            links_df=links_df
        )
        update_step("02_preprocess", "COMPLETED")
        
        # Step 3: Model Training
        update_step("03_train", "IN_PROGRESS")
        baseline_model, tuned_rf = train_models(train_df=train_df)
        update_step("03_train", "COMPLETED")
        
        # Step 4: Evaluation & Metrics Report
        update_step("04_evaluate", "IN_PROGRESS")
        metrics = evaluate_models(model=tuned_rf, test_df=test_df, movies_df=movies_df)
        update_step("04_evaluate", "COMPLETED")
        
        duration = round(time.time() - start_time, 2)
        logger.info(f"=== Machine Learning Pipeline completed successfully in {duration}s! ===")
        
        return {
            "status": "SUCCESS",
            "duration_seconds": duration,
            "metrics": metrics
        }
    except Exception as e:
        logger.error(f"Pipeline execution error: {e}", exc_info=True)
        raise

if __name__ == "__main__":
    run_entire_pipeline()
