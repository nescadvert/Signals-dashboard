@echo off
TITLE Signals Dashboard - Startup
echo 🚀 Demarrage du Signals Dashboard...
echo.
cd /d "%~dp0"
call npm run dev -- --open
pause
