---
title: Levi AI Coder
emoji: ⚡
colorFrom: purple
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
short_description: AI coding assistant powered by Qwen2.5-Coder
---

# Levi AI Coder

A production-ready AI coding assistant running **Qwen2.5-Coder-0.5B** locally via llama.cpp with a React + FastAPI stack.

## Features

- **AI Chat** – Chat with a local LLM for code help, debugging, and explanations
- **Code Playground** – Monaco Editor with code completion (FIM) support
- **Dashboard** – Quick actions, recent conversations, example prompts
- **Streaming** – Real-time token streaming via SSE

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4, Framer Motion |
| Backend | Python 3.11, FastAPI, Uvicorn |
| LLM Engine | llama-cpp-python (CPU inference) |
| Model | Qwen2.5-Coder-0.5B-Instruct (Q4_K_M, ~500MB) |

## Deploy on Hugging Face Spaces

This repo is configured for **Docker-based** Spaces deployment.

### One-click Deploy

[![Deploy to HF Spaces](https://huggingface.co/datasets/huggingface/badges/raw/main/deploy-to-spaces-lg.svg)](https://huggingface.co/new-space?template=Jinxcoder09/Levi)

### Manual Steps

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) → **Create new Space**
2. Set **Space name** (e.g. `levi-ai-coder`)
3. Set **License** to `apache-2.0`
4. **Space SDK**: select **Docker**
5. Choose **Docker template** (or leave default)
6. Set **Space hardware** – CPU basic is fine (2 vCPU, 16GB RAM)
7. Connect your GitHub repo or upload files directly
8. Click **Create Space**

The Dockerfile will build automatically. First deploy takes ~5-10 minutes (model download). Subsequent deploys use the cached Docker layers.

### Environment Variables (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_TEMPERATURE` | `0.7` | LLM temperature |
| `DEFAULT_MAX_TOKENS` | `1024` | Max generated tokens |
| `DEFAULT_CONTEXT_LENGTH` | `2048` | Context window |

---

Built with [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) and [FastAPI](https://fastapi.tiangolo.com/).
