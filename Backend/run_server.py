"""Production server launcher for Movie Recommendation & Rating Prediction System."""

import sys
from pathlib import Path
import argparse
import uvicorn

# Ensure the backend directory is in the Python module search path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings

def main():
    parser = argparse.ArgumentParser(description="Run the FastAPI Recommendation Service Backend")
    parser.add_argument("--host", default=settings.HOST, help=f"Host address (default: {settings.HOST})")
    parser.add_argument("--port", type=int, default=settings.PORT, help=f"Port number (default: {settings.PORT})")
    parser.add_argument("--reload", action="store_true", default=True, help="Enable live auto-reload (default: True)")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes (default: 1)")

    args = parser.parse_args()

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    print(f"[*] Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"[*] Server running at: http://{args.host}:{args.port}")
    print(f"[*] Swagger UI docs at: http://{args.host}:{args.port}/docs")
    print(f"[*] ReDoc docs at:      http://{args.host}:{args.port}/redoc")

    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1
    )

if __name__ == "__main__":
    main()
