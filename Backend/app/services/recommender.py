import re
import os
import threading
from typing import Dict, Any, List, Optional, Tuple
import joblib
import numpy as np

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import ModelNotReadyException, MovieNotFoundException

def parse_year_from_title(title: str) -> Tuple[str, Optional[int]]:
    """Extract clean title and 4-digit release year from 'Title (YYYY)'."""
    match = re.search(r"^(.*?)(?:\s*\((\d{4})\))?$", title.strip())
    if match:
        clean_title = match.group(1).strip()
        year = int(match.group(2)) if match.group(2) else None
        return clean_title, year
    return title.strip(), None

class RecommenderService:
    """Production Machine Learning Recommender Service.
    
    Loads precomputed lookup dictionaries, dense core metadata, and the tuned
    RandomForest classifier to deliver sub-10ms predictions and Top-N recommendations.
    """
    
    _instance: Optional["RecommenderService"] = None
    _lock = threading.Lock()

    def __init__(self):
        self.is_ready = False
        self.model = None
        self.user_avgs: Dict[int, float] = {}
        self.movie_avgs: Dict[int, float] = {}
        self.movie_meta: Dict[int, Dict[str, str]] = {}
        self.movie_links: Dict[int, str] = {}
        self.movie_tmdb: Dict[int, int] = {}
        self.title_to_id: Dict[str, int] = {}
        self.clean_title_to_id: Dict[str, int] = {}
        self.global_avg: float = 3.65
        self._cached_insights: Optional[Dict[str, Any]] = None
        self._cached_genres: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def get_instance(cls) -> "RecommenderService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
                    cls._instance.load_artifacts()
        return cls._instance

    def load_artifacts(self) -> None:
        """Load trained models and lookup tables into memory."""
        try:
            logger.info("Loading model artifacts and lookup tables...")
            
            # 1. Load Lookup Tables
            lookup_path = settings.LOOKUP_TABLES_PATH
            if not lookup_path.exists():
                logger.error(f"Lookup tables file not found at: {lookup_path}")
                self.is_ready = False
                return

            tables = joblib.load(lookup_path)
            self.user_avgs = tables.get("user_avgs", {})
            self.movie_avgs = tables.get("movie_avgs", {})
            self.movie_meta = tables.get("movie_meta", {})
            self.global_avg = float(tables.get("global_avg", 3.65))
            self.title_to_id = tables.get("title_to_id", {})
            self.movie_links = tables.get("movie_links", {})
            self.movie_tmdb = tables.get("movie_tmdb", {})

            # Build fast clean title lookup
            for title, m_id in self.title_to_id.items():
                clean_t, _ = parse_year_from_title(title)
                c_key = clean_t.lower()
                if c_key not in self.clean_title_to_id:
                    self.clean_title_to_id[c_key] = m_id

            # 2. Load Tuned Model
            model_path = settings.MODEL_TUNED_PATH
            if not model_path.exists():
                logger.error(f"Model file not found at: {model_path}")
                self.is_ready = False
                return

            self.model = joblib.load(model_path)
            self.is_ready = True

            logger.info(
                f"Recommender Service loaded successfully! "
                f"Users: {len(self.user_avgs):,}, "
                f"Dense Movies: {len(self.movie_avgs):,}, "
                f"Catalog Movies: {len(self.movie_meta):,}, "
                f"IMDb Links: {len(self.movie_links):,}"
            )
        except Exception as e:
            logger.error(f"Failed to load model artifacts: {e}", exc_info=True)
            self.is_ready = False

    def build_imdb_url(self, m_id: int) -> Optional[str]:
        imdb = self.movie_links.get(m_id)
        return f"https://www.imdb.com/title/tt{imdb}/" if imdb else None

    def find_movie_id(self, movie_id: Optional[int] = None, movie_name: Optional[str] = None) -> Tuple[int, str, str]:
        """Resolve a movie ID or fuzzy title to (movie_id, title, genres)."""
        # 1. Direct ID lookup
        if movie_id is not None:
            if movie_id in self.movie_meta:
                meta = self.movie_meta[movie_id]
                return movie_id, meta["title"], meta["genres"]
            raise MovieNotFoundException(str(movie_id))

        # 2. Movie Name lookup
        if not movie_name or not movie_name.strip():
            # Fallback to catalog default (Toy Story)
            fallback_id = 1
            meta = self.movie_meta.get(fallback_id, {"title": "Toy Story (1995)", "genres": "Animation|Children|Comedy"})
            return fallback_id, meta["title"], meta["genres"]

        q_clean = movie_name.strip()
        q_lower = q_clean.lower()

        # Exact title match
        if q_lower in self.title_to_id:
            m_id = self.title_to_id[q_lower]
            meta = self.movie_meta[m_id]
            return m_id, meta["title"], meta["genres"]

        # Exact clean title match
        if q_lower in self.clean_title_to_id:
            m_id = self.clean_title_to_id[q_lower]
            meta = self.movie_meta[m_id]
            return m_id, meta["title"], meta["genres"]

        # Substring / Prefix scoring match
        best_id = None
        best_score = -1

        for m_id, meta in self.movie_meta.items():
            title = meta["title"]
            t_lower = title.lower()
            if q_lower in t_lower:
                clean_t, _ = parse_year_from_title(title)
                c_lower = clean_t.lower()
                m_avg = self.movie_avgs.get(m_id, self.global_avg)
                
                score = 30
                if c_lower.startswith(q_lower):
                    score += 40
                if (" " + q_lower) in (" " + c_lower):
                    score += 20
                if m_id in self.movie_avgs:
                    score += 15
                score += min(float(m_avg), 5.0)

                if score > best_score:
                    best_score = score
                    best_id = m_id

        if best_id is not None:
            meta = self.movie_meta[best_id]
            return best_id, meta["title"], meta["genres"]

        raise MovieNotFoundException(movie_name)

    def search_movies(self, query: str = "", limit: int = 20) -> List[Dict[str, Any]]:
        """Search movies with relevance scoring and popularity boost."""
        if not self.is_ready:
            raise ModelNotReadyException()

        q_clean = query.strip()
        q_lower = q_clean.lower()

        # Empty search: return top rated popular catalog favorites
        if not q_lower:
            top_dense = sorted(self.movie_avgs.items(), key=lambda x: x[1], reverse=True)[:limit]
            results = []
            for m_id, m_avg in top_dense:
                meta = self.movie_meta.get(m_id)
                if meta:
                    clean_t, year = parse_year_from_title(meta["title"])
                    results.append({
                        "movie_id": m_id,
                        "title": meta["title"],
                        "clean_title": clean_t,
                        "year": year,
                        "genres": [g for g in meta["genres"].split("|") if g and g != "(no genres listed)"],
                        "movie_avg_rating": round(float(m_avg), 2),
                        "imdb_id": self.movie_links.get(m_id),
                        "imdb_url": self.build_imdb_url(m_id),
                        "is_dense_catalog": True
                    })
            return results

        scored = []
        for m_id, meta in self.movie_meta.items():
            title = meta["title"]
            t_lower = title.lower()
            if q_lower in t_lower:
                clean_t, year = parse_year_from_title(title)
                c_lower = clean_t.lower()
                m_avg = self.movie_avgs.get(m_id, self.global_avg)
                is_dense = m_id in self.movie_avgs

                if c_lower == q_lower:
                    score = 100
                elif c_lower.startswith(q_lower):
                    score = 80
                elif (" " + q_lower) in (" " + c_lower) or ("(" + q_lower) in (" " + c_lower):
                    score = 65
                else:
                    score = 35

                if is_dense:
                    score += 15
                score += min(float(m_avg), 5.0)

                scored.append((score, m_id, meta, clean_t, year, m_avg, is_dense))

        scored.sort(key=lambda x: x[0], reverse=True)

        results = []
        for _, m_id, meta, clean_t, year, m_avg, is_dense in scored[:limit]:
            results.append({
                "movie_id": m_id,
                "title": meta["title"],
                "clean_title": clean_t,
                "year": year,
                "genres": [g for g in meta["genres"].split("|") if g and g != "(no genres listed)"],
                "movie_avg_rating": round(float(m_avg), 2),
                "imdb_id": self.movie_links.get(m_id),
                "imdb_url": self.build_imdb_url(m_id),
                "is_dense_catalog": is_dense
            })
        return results

    def get_movie_details(self, movie_id: int) -> Dict[str, Any]:
        """Fetch rich movie details, overview, and IMDb link."""
        if not self.is_ready:
            raise ModelNotReadyException()

        if movie_id not in self.movie_meta:
            raise MovieNotFoundException(str(movie_id))

        meta = self.movie_meta[movie_id]
        m_avg = self.movie_avgs.get(movie_id, self.global_avg)
        clean_t, year = parse_year_from_title(meta["title"])
        genres_list = [g for g in meta["genres"].split("|") if g and g != "(no genres listed)"]
        imdb_id = self.movie_links.get(movie_id)
        imdb_url = self.build_imdb_url(movie_id)

        primary_genre = genres_list[0] if genres_list else "Feature"
        overview = (
            f"'{clean_t}' is an acclaimed {primary_genre} film released in {year if year else 'theaters'}. "
            f"According to verified historical audience ratings in MovieLens, it holds a mean rating of "
            f"{round(float(m_avg), 2)} out of 5.0 stars."
        )

        return {
            "movie_id": movie_id,
            "title": meta["title"],
            "clean_title": clean_t,
            "year": year,
            "genres": genres_list,
            "movie_avg_rating": round(float(m_avg), 2),
            "imdb_id": imdb_id,
            "imdb_url": imdb_url,
            "overview": overview,
            "recommendation_explanation": (
                f"Audience satisfaction score: ★ {round(float(m_avg), 2)}. "
                f"Genres: {' • '.join(genres_list)}."
            )
        }

    def predict_like(
        self,
        user_id: int = 1,
        movie_id: Optional[int] = None,
        movie_name: Optional[str] = None,
        user_rating: Optional[float] = None
    ) -> Dict[str, Any]:
        """Predict whether a target user will like a specific movie."""
        if not self.is_ready:
            raise ModelNotReadyException()

        m_id, m_title, m_genres = self.find_movie_id(movie_id, movie_name)
        clean_t, year = parse_year_from_title(m_title)
        imdb_id = self.movie_links.get(m_id)
        imdb_url = self.build_imdb_url(m_id)

        # Baseline user rating
        if user_rating is not None:
            val = float(user_rating)
            u_avg = (val / 2.0) if val > 5.0 else val
        else:
            u_avg = float(self.user_avgs.get(user_id, self.global_avg))

        m_avg = float(self.movie_avgs.get(m_id, self.global_avg))

        # Inference with Tuned Random Forest: feature vector [[user_avg, movie_avg]]
        features = np.array([[u_avg, m_avg]])
        prob = float(self.model.predict_proba(features)[0][1])
        pred = bool(prob >= settings.PROBABILITY_LIKE_THRESHOLD)

        verdict = (
            "Highly Recommended! Matches your viewing preferences."
            if prob >= 0.70
            else ("Recommended based on your taste profile." if pred else "Not Recommended: Lower historical alignment.")
        )

        return {
            "user_id": user_id,
            "movie_id": m_id,
            "movie_title": m_title,
            "clean_title": clean_t,
            "year": year,
            "imdb_id": imdb_id,
            "imdb_url": imdb_url,
            "genres": [g for g in m_genres.split("|") if g and g != "(no genres listed)"],
            "is_liked": pred,
            "confidence": round(prob, 4),
            "match_score_pct": int(round(prob * 100)),
            "user_avg_rating": round(u_avg, 2),
            "movie_avg_rating": round(m_avg, 2),
            "recommendation_verdict": verdict
        }

    def recommend_top_n(
        self,
        user_id: int = 1,
        top_n: int = 10,
        genre_filter: Optional[str] = None,
        user_rating: Optional[float] = None,
        movie_id: Optional[int] = None,
        movie_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate high-speed vectorized Top-N ranked recommendations."""
        if not self.is_ready:
            raise ModelNotReadyException()

        top_n = min(max(1, top_n), settings.MAX_TOP_N)

        if user_rating is not None:
            val = float(user_rating)
            u_avg = (val / 2.0) if val > 5.0 else val
        else:
            u_avg = float(self.user_avgs.get(user_id, self.global_avg))

        source_movie_info = None
        src_id = None
        filter_genres = []

        if movie_id is not None or (movie_name and movie_name.strip()):
            src_id, src_title, src_genres = self.find_movie_id(movie_id, movie_name)
            clean_src_t, src_year = parse_year_from_title(src_title)
            src_genres_list = [g for g in src_genres.split("|") if g and g != "(no genres listed)"]
            source_movie_info = {
                "movie_id": src_id,
                "title": src_title,
                "clean_title": clean_src_t,
                "year": src_year,
                "genres": src_genres_list,
                "imdb_id": self.movie_links.get(src_id),
                "imdb_url": self.build_imdb_url(src_id),
                "user_rating": user_rating
            }
            if not genre_filter and src_genres_list:
                filter_genres = [g.lower() for g in src_genres_list[:2]]

        if genre_filter and genre_filter.strip().lower() not in ("all", "any"):
            filter_genres = [genre_filter.strip().lower()]

        # Filter candidates from dense core movies
        candidate_ids = []
        candidate_m_avgs = []

        # Pass 1: Candidates matching genre filter
        for m_id, m_avg in self.movie_avgs.items():
            if src_id is not None and m_id == src_id:
                continue
            meta = self.movie_meta.get(m_id)
            if not meta:
                continue

            genres_str = meta["genres"].lower()
            if filter_genres and not any(fg in genres_str for fg in filter_genres):
                continue

            candidate_ids.append(m_id)
            candidate_m_avgs.append(float(m_avg))

        # Fallback pass if filtered candidates are fewer than requested top_n
        if len(candidate_ids) < top_n:
            for m_id, m_avg in self.movie_avgs.items():
                if src_id is not None and m_id == src_id:
                    continue
                if m_id not in candidate_ids:
                    candidate_ids.append(m_id)
                    candidate_m_avgs.append(float(m_avg))

        if not candidate_ids:
            return {
                "user_id": user_id,
                "user_avg_rating": round(u_avg, 2),
                "total_recommendations": 0,
                "recommendations": [],
                "source_movie": source_movie_info,
                "genre_filter": genre_filter
            }

        # Vectorized feature matrix (N, 2)
        X_candidates = np.column_stack([
            np.full(len(candidate_m_avgs), u_avg),
            np.array(candidate_m_avgs)
        ])

        # Vectorized batch prediction with Random Forest
        probs = self.model.predict_proba(X_candidates)[:, 1]
        top_indices = np.argsort(probs)[::-1][:top_n]

        top_recs = []
        for rank, idx in enumerate(top_indices, start=1):
            m_id = candidate_ids[idx]
            prob = float(probs[idx])
            m_avg = candidate_m_avgs[idx]
            meta = self.movie_meta[m_id]
            clean_t, year = parse_year_from_title(meta["title"])
            imdb_id = self.movie_links.get(m_id)
            imdb_url = self.build_imdb_url(m_id)

            rec_label = (
                "Must Watch"
                if prob >= 0.70
                else ("Highly Recommended" if prob >= 0.60 else "Recommended")
            )

            top_recs.append({
                "rank": rank,
                "movie_id": m_id,
                "title": meta["title"],
                "clean_title": clean_t,
                "year": year,
                "genres": [g for g in meta["genres"].split("|") if g and g != "(no genres listed)"],
                "predicted_probability": round(prob, 4),
                "match_score_pct": int(round(prob * 100)),
                "movie_avg_rating": round(m_avg, 2),
                "recommendation": rec_label,
                "imdb_id": imdb_id,
                "imdb_url": imdb_url
            })

        return {
            "user_id": user_id,
            "user_avg_rating": round(u_avg, 2),
            "total_recommendations": len(top_recs),
            "recommendations": top_recs,
            "source_movie": source_movie_info,
            "genre_filter": genre_filter
        }

    def get_data_insights(self) -> Dict[str, Any]:
        """Return catalog analytics, distributions, and top rated titles."""
        if not self.is_ready:
            raise ModelNotReadyException()

        if self._cached_insights:
            return self._cached_insights

        genre_counts: Dict[str, int] = {}
        for meta in self.movie_meta.values():
            for g in meta.get("genres", "").split("|"):
                g = g.strip()
                if g and g != "(no genres listed)":
                    genre_counts[g] = genre_counts.get(g, 0) + 1

        sorted_genres = sorted(
            [{"name": k, "count": v} for k, v in genre_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )

        top_movies_dense = sorted(
            self.movie_avgs.items(),
            key=lambda item: item[1],
            reverse=True
        )[:10]

        top_rated = []
        for m_id, avg_r in top_movies_dense:
            meta = self.movie_meta.get(m_id, {"title": "Unknown", "genres": ""})
            clean_t, yr = parse_year_from_title(meta["title"])
            top_rated.append({
                "movie_id": m_id,
                "title": meta["title"],
                "clean_title": clean_t,
                "year": yr,
                "genres": [g for g in meta["genres"].split("|") if g and g != "(no genres listed)"],
                "movie_avg_rating": round(float(avg_r), 2),
                "imdb_id": self.movie_links.get(m_id),
                "imdb_url": self.build_imdb_url(m_id),
                "is_dense_catalog": True
            })

        self._cached_insights = {
            "total_movies": len(self.movie_meta),
            "dense_core_movies": len(self.movie_avgs),
            "total_users": len(self.user_avgs),
            "global_avg_rating": round(self.global_avg, 2),
            "genres": sorted(list(genre_counts.keys())),
            "top_genres": sorted_genres[:12],
            "top_rated_movies": top_rated
        }
        return self._cached_insights

    def get_genres(self) -> List[Dict[str, Any]]:
        """Return all distinct genres with frequency counts."""
        if not self.is_ready:
            raise ModelNotReadyException()

        if self._cached_genres:
            return self._cached_genres

        counts: Dict[str, int] = {}
        for meta in self.movie_meta.values():
            for g in meta.get("genres", "").split("|"):
                g = g.strip()
                if g and g != "(no genres listed)":
                    counts[g] = counts.get(g, 0) + 1

        self._cached_genres = sorted(
            [{"name": k, "count": v} for k, v in counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )
        return self._cached_genres

def get_recommender_service() -> RecommenderService:
    return RecommenderService.get_instance()
