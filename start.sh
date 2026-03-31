#!/bin/bash

# GuardianHealth - Quick Start Script
# This script sets up and runs the GuardianHealth application

echo "============================================================"
echo "🎯 GuardianHealth - Quick Start Setup"
echo "============================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed"
    echo "Please install Python 3.8 or higher from python.org"
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "✓ Python found: $($PYTHON_CMD --version)"
echo ""

# Step 1: Install dependencies
echo "[1/4] Installing Python dependencies..."
$PYTHON_CMD -m pip install -q -r requirements.txt
if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Step 2: Train model if weights don't exist
if [ ! -f "model_weights.json" ]; then
    echo "[2/4] Training machine learning model..."
    $PYTHON_CMD heart_model.py
    if [ $? -eq 0 ]; then
        echo "✓ Model trained successfully"
    else
        echo "❌ Model training failed"
        exit 1
    fi
else
    echo "[2/4] Model weights already exist, skipping training"
    echo "✓ Using existing model"
fi
echo ""

# Step 3: Start backend server in background
echo "[3/4] Starting Flask backend server..."
echo "Server will run on http://localhost:5000"
$PYTHON_CMD backend.py &
BACKEND_PID=$!
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo "✓ Backend server started (PID: $BACKEND_PID)"
else
    echo "❌ Failed to start backend server"
    exit 1
fi
echo ""

# Step 4: Start frontend server
echo "[4/4] Starting frontend server..."
echo "Frontend will run on http://localhost:8000"
echo ""
echo "============================================================"
echo "✅ GuardianHealth is now running!"
echo "============================================================"
echo ""
echo "🌐 Open your browser and go to:"
echo "   http://localhost:8000"
echo ""
echo "📚 Backend API is available at:"
echo "   http://localhost:5000"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo "============================================================"
echo ""

# Start frontend server
$PYTHON_CMD -m http.server 8000

# Cleanup: Kill backend when frontend server stops
echo ""
echo "Shutting down servers..."
kill $BACKEND_PID 2>/dev/null
echo "✓ Servers stopped"
echo "Thank you for using GuardianHealth! ❤️"
