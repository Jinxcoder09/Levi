# Cloud Deployment Guide 🌐

This document covers instructions on deploying the unified **Antigravity AI Coder** container to Railway and Render.

---

## <a name="railway"></a> 🚄 Railway Deployment (Preferred)

Railway is the recommended host because of its native support for Dockerfile builds, fast container deployments, and reliable persistent volumes.

### Step 1: Create a Railway Project
1. Log into your [Railway Console](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.

### Step 2: Configure Environment Variables
Add the following variables in Railway's **Variables** tab:
* `PORT` = `8000`
* `HOST` = `0.0.0.0`
* `INFERENCE_MODE` = `auto` (Routes to Hugging Face Cloud if container RAM is limited)
* `HF_API_TOKEN` = `your_huggingface_api_token` (Strongly recommended to avoid rate limits)
* `HF_MODEL_ID` = `Qwen/Qwen2.5-Coder-0.5B-Instruct`
* `SECRET_KEY` = `generate-a-long-random-string`

### Step 3: Mount a Persistent Volume (Optional but Recommended)
To prevent the container from re-downloading the 397MB local model file on every restart:
1. In the service settings, click **Volume** -> **Add Volume**.
2. Mount the volume to: `/app/models`.
3. Save the changes. Railway will now persist the downloaded GGUF file inside this volume.

---

## <a name="render"></a> 💎 Render Deployment

Render supports Docker builds out of the box using our blueprint `render.yaml` configuration.

### Step 1: Deploy using render.yaml Blueprint
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New** -> **Blueprint**.
3. Link your repository. Render will automatically read the `render.yaml` file from your repo root.
4. Render will prompt you for:
   * **Service Name:** `antigravity-ai-coder`
   * **HF_API_TOKEN:** Provide your Hugging Face API key.

### Step 2: Custom Scaling & Memory Fallback
* **On Free Instances:** Render's free tier provides 512MB RAM. Since 512MB is below our local inference threshold, the backend will boot up, detect the system memory limit, and automatically switch to `huggingface` cloud fallback mode.
* **On Paid Instances:** If you upgrade to a Starter or Standard instance (>= 2GB RAM) and keep `INFERENCE_MODE=auto`, it will download and run the GGUF model locally. The blueprint allocates a 10GB persistent disk mounted to `/app/models` to store the model file.
