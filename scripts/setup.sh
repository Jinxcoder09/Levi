#!/bin/bash
# Antigravity Coder Setup Script

set -e

echo "=== Starting Antigravity Coder Installation ==="

# Check requirements
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.11+."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 20+."
    exit 1
fi

# 1. Setup Python Virtual Environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# 2. Install Python Dependencies
echo "Installing backend dependencies (this may compile llama-cpp-python)..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# 3. Install Frontend Dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# 4. Build Frontend Assets
echo "Compiling frontend assets..."
cd frontend
npm run build
cd ..

# 5. Pre-download local model
echo "Downloading Qwen2.5-Coder model..."
source venv/bin/activate
python scripts/download_model.py

echo "============================================="
echo "Setup Complete!"
echo "To start the backend: source venv/bin/activate && python backend/run.py"
echo "To start frontend dev server: cd frontend && npm run dev"
echo "============================================="
