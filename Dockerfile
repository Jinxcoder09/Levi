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
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cpu -r ./backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Pre-download model so container starts fast (avoids HF Spaces startup timeout)
COPY scripts/setup_model.py /tmp/setup_model.py
RUN python /tmp/setup_model.py && rm /tmp/setup_model.py

ENV PORT=7860 HOST=0.0.0.0 PYTHONPATH=/app

EXPOSE 7860

CMD python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-7860}
