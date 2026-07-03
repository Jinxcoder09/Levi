# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Pre-download model so container starts fast (avoids HF Spaces startup timeout)
RUN python -c "
import os
os.makedirs('models', exist_ok=True)
from huggingface_hub import hf_hub_download
hf_hub_download(
    repo_id='bartowski/Qwen2.5-Coder-0.5B-Instruct-GGUF',
    filename='Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf',
    local_dir='models',
    local_dir_use_symlinks=False
)
"

ENV PORT=8000 HOST=0.0.0.0 PYTHONPATH=/app

EXPOSE 7860

CMD python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}
