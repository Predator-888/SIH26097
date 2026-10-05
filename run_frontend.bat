@echo off
title PM-AJAY Voice Assistant Frontend (CSC Kiosk & Omnichannel Simulator)
echo ========================================================
echo Starting PM-AJAY Kiosk PWA & Omnichannel Simulator...
echo URL: http://localhost:3000
echo ========================================================
cd /d %~dp0\frontend
start http://localhost:3000
python -m http.server 3000
pause
