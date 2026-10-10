@echo off
title PAHWAJEE Backend
cd /d "%~dp0app\backend"
echo Starting PAHWAJEE API on port 5000...
python -m uvicorn server:app --host 0.0.0.0 --port 5000
