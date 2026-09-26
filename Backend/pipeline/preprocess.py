import os
import gc
from pathlib import Path
from typing import Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import joblib

from app.core.config import settings
from app.core.logging import logger

RANDOM_STATE = 42

def preprocess_and_split(
    movies_df: pd.DataFrame,
    ratings_df: pd.DataFrame,
    links_df: pd.DataFrame,
    min_movie_ratings: int = 100,
    min_user_ratings: int = 25,
    test_size: float = 0.20
) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """Clean data, filter dense core, engineer features, scale ratings, and create lookup tables.
    
    Returns:
        Tuple of (train_df, test_df, lookup_tables)
    """
    logger.info("Starting preprocessing and dense core filtering...")
    
    # 1. Clean missing values
    movies_df = movies_df.dropna(subset=['movieId', 'title']).copy()
    ratings_df = ratings_df.dropna(subset=['userId', 'movieId', 'rating']).copy()
    
    initial_ratings = len(ratings_df)
    
    # 2. Dense Core Filtering
    movie_counts = ratings_df['movieId'].value_counts()
    valid_movies = movie_counts[movie_counts >= min_movie_ratings].index
    ratings_df = ratings_df[ratings_df['movieId'].isin(valid_movies)]
    
    user_counts = ratings_df['userId'].value_counts()
    valid_users = user_counts[user_counts >= min_user_ratings].index
    ratings_df = ratings_df[ratings_df['userId'].isin(valid_users)]
    
    logger.info(
        f"Filtered ratings to dense core: {len(ratings_df):,} retained from {initial_ratings:,} "
        f"({(len(ratings_df) / initial_ratings) * 100:.1f}%)"
    )
    
    # 3. Define target variable: 1 if rating >= 4.0 else 0
    ratings_df['is_liked'] = (ratings_df['rating'] >= settings.DEFAULT_LIKE_THRESHOLD).astype(int)
    
    # 4. Train-Test Split (80/20)
    train_df, test_df = train_test_split(
        ratings_df,
        test_size=test_size,
        random_state=RANDOM_STATE,
        stratify=ratings_df['is_liked']
    )
    
    # Copy to avoid SettingWithCopy warnings
    train_df = train_df.copy()
    test_df = test_df.copy()
    
    # 5. Fit Scaler on TRAIN ONLY (prevents data leakage)
    scaler = MinMaxScaler()
    train_df['rating_scaled'] = scaler.fit_transform(train_df[['rating']])
    test_df['rating_scaled'] = scaler.transform(test_df[['rating']])
    
    # Save Scaler
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(scaler, settings.SCALER_PATH)
    logger.info(f"Fitted MinMaxScaler saved to: {settings.SCALER_PATH}")
    
    # 6. Engineer Collaborative Filtering Features from TRAIN ONLY
    user_avgs = train_df.groupby('userId')['rating'].mean().to_dict()
    movie_avgs = train_df.groupby('movieId')['rating'].mean().to_dict()
    global_avg = float(train_df['rating'].mean())
    
    train_df['user_avg'] = train_df['userId'].map(user_avgs)
    train_df['movie_avg'] = train_df['movieId'].map(movie_avgs)
    
    test_df['user_avg'] = test_df['userId'].map(user_avgs).fillna(global_avg)
    test_df['movie_avg'] = test_df['movieId'].map(movie_avgs).fillna(global_avg)
    
    # 7. Save Processed Datasets
    settings.DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    train_save_path = settings.DATA_PROCESSED_DIR / "train.csv"
    test_save_path = settings.DATA_PROCESSED_DIR / "test.csv"
    
    save_cols = ['userId', 'movieId', 'rating', 'rating_scaled', 'is_liked', 'user_avg', 'movie_avg']
    train_df[save_cols].to_csv(train_save_path, index=False)
    test_df[save_cols].to_csv(test_save_path, index=False)
    logger.info(f"Processed datasets saved to {train_save_path} and {test_save_path}")
    
    # 8. Build Comprehensive Lookup Tables for Sub-Millisecond Recommender Inference
    logger.info("Building catalog lookup tables and metadata indices...")
    movie_meta = {}
    title_to_id = {}
    for _, row in movies_df.iterrows():
        m_id = int(row['movieId'])
        t = str(row['title']).strip()
        g = str(row['genres']).strip()
        movie_meta[m_id] = {"title": t, "genres": g}
        title_to_id[t.lower()] = m_id
        
    movie_links = {}
    movie_tmdb = {}
    if links_df is not None and not links_df.empty:
        for _, row in links_df.iterrows():
            m_id = int(row['movieId'])
            imdb_val = str(row['imdbId']).split('.')[0].strip() if pd.notnull(row.get('imdbId')) else None
            tmdb_val = int(row['tmdbId']) if pd.notnull(row.get('tmdbId')) and str(row.get('tmdbId')).replace('.', '').isdigit() else None
            if imdb_val:
                movie_links[m_id] = imdb_val.zfill(7)
            if tmdb_val:
                movie_tmdb[m_id] = tmdb_val
                
    lookup_tables = {
        "user_avgs": user_avgs,
        "movie_avgs": movie_avgs,
        "global_avg": global_avg,
        "movie_meta": movie_meta,
        "title_to_id": title_to_id,
        "movie_links": movie_links,
        "movie_tmdb": movie_tmdb
    }
    
    joblib.dump(lookup_tables, settings.LOOKUP_TABLES_PATH)
    logger.info(f"Lookup tables saved to {settings.LOOKUP_TABLES_PATH} with {len(movie_meta):,} catalog movies.")
    
    gc.collect()
    return train_df, test_df, lookup_tables
