#!/bin/bash
set -e

echo "=== Levi AI Coder Setup ==="

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

cd frontend
npm install
npm run build
cd ..

python scripts/download_model.py

echo "=== Done! Run: source venv/bin/activate && python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 ==="
