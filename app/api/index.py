"""Vercel ASGI entrypoint; the local uvicorn entrypoint stays backend/server.py."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from server import app  # noqa: E402,F401
