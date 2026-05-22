@echo off
echo =======================================================
echo    APT Real-Time Order System - Startup Script (Windows)
echo =======================================================
echo.
echo [1/2] Installing dependencies...
cd backend
call npm install
echo.
echo [2/2] Starting server and creating database (if needed)...
call npm start
pause
