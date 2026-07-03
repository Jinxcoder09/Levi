# Stage 1: Build React Frontend
FROM node:20-slim as frontend-builder

WORKDIR /frontend

# Copy package config and lock files
COPY frontend/package*.json ./

# Install packages
RUN npm ci

# Copy frontend source files
COPY frontend/ ./

# Build production static bundle
RUN npm run build

# Stage 2: Build Python Backend & Package app
FROM python:3.11-slim

WORKDIR /app

# Install compilation tools for building llama-cpp-python in backend
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    python3-dev \
    git \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy static frontend build from Stage 1 into frontend/dist
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Setup environments
ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONPATH=/app

EXPOSE 8000

# Start unified server
CMD ["python", "backend/run.py"]
