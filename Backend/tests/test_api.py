import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "endpoints" in data

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["model_loaded"] is True
    assert "vocabulary_sizes" in data

def test_movie_search():
    response = client.get("/api/v1/movies/search?query=Toy+Story")
    assert response.status_code == 200
    data = response.json()
    assert data["results_count"] > 0
    assert any("Toy Story" in m["title"] for m in data["results"])

def test_top_movies():
    response = client.get("/api/v1/movies/top?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    assert "movie_id" in data[0]
    assert "movie_avg_rating" in data[0]

def test_movie_details():
    response = client.get("/api/v1/movies/1")
    assert response.status_code == 200
    data = response.json()
    assert data["movie_id"] == 1
    assert "Toy Story" in data["title"]
    assert len(data["genres"]) > 0

def test_genres():
    response = client.get("/api/v1/genres")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(g["name"] == "Action" for g in data)

def test_predict_like():
    payload = {
        "user_id": 1,
        "movie_name": "Toy Story",
        "user_rating": 4.5
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "is_liked" in data
    assert 0.0 <= data["confidence"] <= 1.0
    assert 0 <= data["match_score_pct"] <= 100

def test_recommend_top_n():
    payload = {
        "user_id": 1,
        "top_n": 5,
        "genre_filter": "Animation"
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommendations"]) <= 5
    assert data["total_recommendations"] > 0
    assert "predicted_probability" in data["recommendations"][0]

def test_analytics_insights():
    response = client.get("/api/v1/analytics/insights")
    assert response.status_code == 200
    data = response.json()
    assert data["total_movies"] > 0
    assert len(data["genres"]) > 0
    assert len(data["top_rated_movies"]) > 0

def test_model_performance():
    response = client.get("/api/v1/analytics/model-performance")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data["metrics"]
    assert "roc_auc" in data["metrics"]
    assert len(data["figures"]) > 0

def test_pipeline_status():
    response = client.get("/api/v1/pipeline/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "steps" in data
    assert len(data["steps"]) == 4
