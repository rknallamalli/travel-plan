@echo off
echo ========================================
echo   TravelPlan v1.1 - Local Server
echo ========================================
echo.
echo Starting local web server...
echo.
echo Your app will be available at:
echo http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python -m http.server 8000

pause
