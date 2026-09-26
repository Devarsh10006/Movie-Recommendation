# 🎬 Movie Recommendation & Rating Prediction Backend

An enterprise-ready **FastAPI** Machine Learning backend and automated end-to-end training pipeline built on the **MovieLens 20M** dataset. The system features collaborative filtering feature engineering, tree-based ensemble classification (Tuned Random Forest), fast indexed vector retrieval, and comprehensive reporting.

---

## 🏗️ Project Architecture & Folder Structure

```
Backend/
├── app/                                 # FastAPI Web Application
│   ├── main.py                          # Application entry point, lifespan, CORS, static routes
│   ├── api/
│   │   └── v1/
│   │       ├── api.py                   # Central V1 API router aggregation
│   │       └── endpoints/
│   │           ├── health.py            # System health and artifact status
│   │           ├── movies.py            # Catalog search, details, and top movies
│   │           ├── predict.py           # Single-movie rating liking prediction
│   │           ├── recommend.py         # Vectorized Top-N personalized recommendations
│   │           ├── analytics.py         # Catalog distributions & model performance metrics
│   │           └── pipeline.py          # ML pipeline status & async run trigger
│   ├── core/
│   │   ├── config.py                    # Pydantic BaseSettings & path configuration
│   │   ├── exceptions.py                # Custom business exceptions & HTTP handlers
│   │   └── logging.py                   # Centralized logging formatters
│   ├── models/
│   │   └── schemas.py                   # Pydantic V2 request & response schemas
│   └── services/
│       ├── recommender.py               # In-memory inference engine (<10ms Top-N ranking)
│       └── pipeline_service.py          # Asynchronous pipeline state manager
├── pipeline/                            # End-to-End Machine Learning Pipeline
│   ├── __init__.py                      # Package exports
│   ├── ingest.py                        # Step 1: Raw data validation & memory-efficient loading
│   ├── preprocess.py                    # Step 2: Dense-core filtering, scaling, lookup tables
│   ├── train.py                         # Step 3: Baseline & Tuned Random Forest training
│   ├── evaluate.py                      # Step 4: Test metrics computation & figure generation
│   └── run_pipeline.py                  # Pipeline orchestrator with step callbacks
├── CSVs/                                # Raw MovieLens Datasets
│   ├── movies.csv                       # 62,423 titles with genre tags
│   ├── ratings.csv                      # Historical audience ratings
│   ├── links.csv                        # IMDb and TMDB identifiers
│   ├── tags.csv                         # User tags
│   ├── genome-scores.csv                # Tag relevance scores
│   └── genome-tags.csv                  # Tag vocabulary
├── data/
│   └── processed/                       # Leakage-free train/test splits
│       ├── train.csv                    # Filtered dense-core training split
│       └── test.csv                     # Filtered dense-core testing split
├── models/                              # Serialized Production Artifacts
│   ├── lookup_tables.joblib             # User/movie means, title index, IMDb links
│   ├── random_forest_tuned.joblib       # Best classification model (100 trees, max_depth=15)
│   ├── logistic_regression_lib.joblib   # Baseline classification model
│   └── scaler.joblib                    # Fitted MinMaxScaler (Train split only)
├── reports/                             # Evaluation & Visualizations
│   ├── metrics.json                     # Computed test metrics (Accuracy, ROC-AUC, PR-AUC)
│   └── figures/                         # High-resolution generated evaluation plots
│       ├── 01_ratings_distribution.png
│       ├── 02_avg_rating_by_genre.png
│       ├── 02_top_rated_movies.png
│       ├── 03_scratch_loss_convergence.png
│       ├── 06_confusion_matrix.png
│       ├── 06_roc_curve.png
│       ├── 06_pr_curve.png
│       └── 06_feature_importance.png
├── Tasks/                               # 6-Week Curriculum Jupyter Notebooks
│   ├── week_01_problem_definition_dataset_exploration.ipynb
│   ├── week_02_cleaning_preprocessing_eda.ipynb
│   ├── week_03_model_creation.ipynb
│   ├── week_04_model_evaluation.ipynb
│   ├── week_05_advanced_modeling.ipynb
│   └── week_06_visualization_metrics.ipynb
├── tests/                               # Backend Integration Test Suite
│   ├── test_api.py                      # Pytest integration tests
│   └── test_backend.py                  # Standard unittest test runner
├── requirements.txt                     # Pinned project dependencies
├── run_server.py                        # Dedicated server launcher script
└── README.md                            # Complete documentation
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the FastAPI Server
Launch using the included launcher:
```bash
python run_server.py
```
Or directly with Uvicorn:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive documentation will be available immediately at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🔄 Machine Learning Pipeline

The project features a 4-step pipeline:

```
[CSVs Raw Data]
       │
       ▼
 [01_ingest]       ── Validates raw files, verifies schemas & missing values
       │
       ▼
 [02_preprocess]   ── Filters dense core, prevents data leakage, fits MinMaxScaler,
       │              generates lookup_tables.joblib & train/test splits
       ▼
 [03_train]        ── Trains Logistic Regression baseline & Tuned Random Forest
       │
       ▼
 [04_evaluate]     ── Evaluates metrics (Accuracy, ROC-AUC, F1, PR-AUC), saves
                      reports/metrics.json & renders all 8 report figures
```

### Triggering the Pipeline

#### Via Python CLI:
```bash
python pipeline/run_pipeline.py
```

#### Via API Endpoint:
```bash
curl -X POST http://127.0.0.1:8000/api/v1/pipeline/run
```

#### Check Pipeline Status:
```bash
curl http://127.0.0.1:8000/api/v1/pipeline/status
```

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | API root welcome page & endpoint catalog |
| `/api/v1/health` | `GET` | Service status, model readiness, vocabulary sizes |
| `/api/v1/movies/search` | `GET` | Search movies with relevance and popularity ranking |
| `/api/v1/movies/top` | `GET` | Top-rated catalog movies |
| `/api/v1/movies/{id}` | `GET` | Rich movie details with IMDb link and overview |
| `/api/v1/genres` | `GET` | List of all distinct genres and their catalog counts |
| `/api/v1/predict` | `POST` | Predict whether a user will like a specific movie |
| `/api/v1/recommend` | `POST` | Vectorized Top-N ranked recommendations |
| `/api/v1/analytics/insights` | `GET` | Dataset distributions & genre breakdowns |
| `/api/v1/analytics/model-performance` | `GET` | Real test set metrics & report figure links |
| `/api/v1/pipeline/status` | `GET` | Current status of the 4 ML pipeline steps |
| `/api/v1/pipeline/run` | `POST` | Asynchronously trigger the end-to-end pipeline |

### Example Request: Top-N Recommendation
```json
POST /api/v1/recommend
{
  "user_id": 1,
  "top_n": 5,
  "genre_filter": "Animation",
  "movie_name": "Toy Story"
}
```

---

## 🧪 Testing

Execute the test suite verifying all 11 endpoints and pipeline integration:
```bash
python -m unittest tests/test_backend.py
```

---

## 📓 Notebooks & Resolved Issues

All 6 notebooks in `Tasks/` have been verified, refreshed, and run with **0 errors and 0 warnings**:
1. `week_01_problem_definition_dataset_exploration.ipynb`: Explores distributions and null counts.
2. `week_02_cleaning_preprocessing_eda.ipynb`: Multi-hot encoding, dense-core filtering. *Fixed Seaborn palette warnings.*
3. `week_03_model_creation.ipynb`: Scratch Logistic Regression (gradient descent) vs library.
4. `week_04_model_evaluation.ipynb`: Generalization check, confusion metrics.
5. `week_05_advanced_modeling.ipynb`: Random Forest hyperparameter tuning. *Removed empty trailing cells, resolved loky multithreading warnings.*
6. `week_06_visualization_metrics.ipynb`: ROC, PR curves, Confusion Matrix, Feature Importances. *Resolved InconsistentVersionWarning and Seaborn FutureWarning.*
