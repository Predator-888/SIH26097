@echo off
title PM-AJAY Voice Assistant (SIH 2026)
echo ========================================================
echo Launching PM-AJAY AI Voice Assistant System
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo ========================================================
start "PM-AJAY Backend" cmd /k "run_backend.bat"
timeout /t 3 /nobreak >nul
start "PM-AJAY Frontend" cmd /k "run_frontend.bat"
echo System started successfully!
