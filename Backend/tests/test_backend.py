import unittest
import sys
import os

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

class TestBackendEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")
        self.assertIn("endpoints", data)

    def test_02_health_endpoint(self):
        res = self.client.get("/api/v1/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn(data["status"], ["healthy", "degraded"])
        self.assertTrue(data["model_loaded"])
        self.assertIn("vocabulary_sizes", data)

    def test_03_movie_search(self):
        res = self.client.get("/api/v1/movies/search?query=Toy+Story")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["results_count"], 0)
        self.assertTrue(any("Toy Story" in m["title"] for m in data["results"]))

    def test_04_top_movies(self):
        res = self.client.get("/api/v1/movies/top?limit=5")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 5)
        self.assertIn("movie_id", data[0])
        self.assertIn("movie_avg_rating", data[0])

    def test_05_movie_details(self):
        res = self.client.get("/api/v1/movies/1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["movie_id"], 1)
        self.assertIn("Toy Story", data["title"])
        self.assertGreater(len(data["genres"]), 0)

    def test_06_genres(self):
        res = self.client.get("/api/v1/genres")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data), 0)
        self.assertTrue(any(g["name"] == "Action" for g in data))

    def test_07_predict_like(self):
        payload = {
            "user_id": 1,
            "movie_name": "Toy Story",
            "user_rating": 4.5
        }
        res = self.client.post("/api/v1/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("is_liked", data)
        self.assertGreaterEqual(data["confidence"], 0.0)
        self.assertLessEqual(data["confidence"], 1.0)
        self.assertGreaterEqual(data["match_score_pct"], 0)
        self.assertLessEqual(data["match_score_pct"], 100)

    def test_08_recommend_top_n(self):
        payload = {
            "user_id": 1,
            "top_n": 5,
            "genre_filter": "Animation"
        }
        res = self.client.post("/api/v1/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertLessEqual(len(data["recommendations"]), 5)
        self.assertGreater(data["total_recommendations"], 0)
        self.assertIn("predicted_probability", data["recommendations"][0])

    def test_09_analytics_insights(self):
        res = self.client.get("/api/v1/analytics/insights")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["total_movies"], 0)
        self.assertGreater(len(data["genres"]), 0)
        self.assertGreater(len(data["top_rated_movies"]), 0)

    def test_10_model_performance(self):
        res = self.client.get("/api/v1/analytics/model-performance")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("accuracy", data["metrics"])
        self.assertIn("roc_auc", data["metrics"])
        self.assertGreater(len(data["figures"]), 0)

    def test_11_pipeline_status(self):
        res = self.client.get("/api/v1/pipeline/status")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("status", data)
        self.assertIn("steps", data)
        self.assertEqual(len(data["steps"]), 4)

if __name__ == "__main__":
    unittest.main()
