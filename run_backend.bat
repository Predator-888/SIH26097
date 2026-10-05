@echo off
title PM-AJAY Voice Assistant Backend (FastAPI)
echo ========================================================
echo Starting PM-AJAY Voice Assistant Backend Server...
echo SIH 2026 - Problem Statement 26097
echo Supported Dialects: Ahirani (Maharashtra) & Telugu (AP/Telangana)
echo ========================================================
cd /d %~dp0\backend
set PYTHONPATH=%~dp0\backend
venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
