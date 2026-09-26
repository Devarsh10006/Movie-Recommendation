import os
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
import joblib

from app.core.config import settings
from app.core.logging import logger

RANDOM_STATE = 42

def train_models(
    train_df: pd.DataFrame,
    max_train_samples: int = 50000
) -> Tuple[LogisticRegression, RandomForestClassifier]:
    """Train baseline Logistic Regression and Tuned Random Forest models.
    
    Args:
        train_df: Preprocessed training dataframe with ['user_avg', 'movie_avg', 'is_liked'].
        max_train_samples: Subsample size for rapid and stable tree training without memory spikes.
        
    Returns:
        Tuple of (baseline_model, tuned_rf_model)
    """
    logger.info("Preparing feature matrices for model training...")
    
    # Subsample if dataset is very large
    if len(train_df) > max_train_samples:
        logger.info(f"Subsampling training set to {max_train_samples:,} rows for fast, balanced convergence...")
        train_sample = train_df.sample(n=max_train_samples, random_state=RANDOM_STATE)
    else:
        train_sample = train_df
        
    X_train = train_sample[['user_avg', 'movie_avg']].values
    y_train = train_sample['is_liked'].values
    
    # 1. Train Baseline Logistic Regression
    logger.info("Training baseline Logistic Regression model...")
    baseline_model = LogisticRegression(random_state=RANDOM_STATE, max_iter=200)
    baseline_model.fit(X_train, y_train)
    
    baseline_path = settings.MODEL_BASELINE_PATH
    joblib.dump(baseline_model, baseline_path)
    logger.info(f"Baseline Logistic Regression saved to: {baseline_path}")
    
    # 2. Train Tuned Random Forest Classifier
    logger.info("Training Tuned RandomForestClassifier (100 estimators, max_depth=15)...")
    tuned_rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_leaf=5,
        random_state=RANDOM_STATE,
        n_jobs=-1
    )
    tuned_rf.fit(X_train, y_train)
    
    tuned_path = settings.MODEL_TUNED_PATH
    joblib.dump(tuned_rf, tuned_path)
    logger.info(f"Tuned Random Forest model saved to: {tuned_path}")
    
    return baseline_model, tuned_rf
