@echo off
REM GuardianHealth - Quick Start Script for Windows
REM This script sets up and runs the GuardianHealth application

echo ============================================================
echo GuardianHealth - Quick Start Setup
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed
    echo Please install Python 3.8 or higher from python.org
    pause
    exit /b 1
)

echo Python found
python --version
echo.

REM Step 1: Install dependencies
echo [1/4] Installing Python dependencies...
python -m pip install -q -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed successfully
echo.

REM Step 2: Train model if weights don't exist
if not exist model_weights.json (
    echo [2/4] Training machine learning model...
    python heart_model.py
    if errorlevel 1 (
        echo Model training failed
        pause
        exit /b 1
    )
    echo Model trained successfully
) else (
    echo [2/4] Model weights already exist, skipping training
    echo Using existing model
)
echo.

REM Step 3: Start backend server
echo [3/4] Starting Flask backend server...
echo Server will run on http://localhost:5000
start "GuardianHealth Backend" python backend.py
timeout /t 3 /nobreak >nul
echo Backend server started
echo.

REM Step 4: Start frontend server
echo [4/4] Starting frontend server...
echo Frontend will run on http://localhost:8000
echo.
echo ============================================================
echo GuardianHealth is now running!
echo ============================================================
echo.
echo Open your browser and go to:
echo    http://localhost:8000
echo.
echo Backend API is available at:
echo    http://localhost:5000
echo.
echo To stop the servers, close this window
echo ============================================================
echo.

REM Start frontend server
python -m http.server 8000

echo.
echo Thank you for using GuardianHealth!
pause
