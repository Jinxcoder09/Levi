import os
import sys

def download_model():
    repo_id = os.getenv("LOCAL_MODEL_REPO", "bartowski/Qwen2.5-Coder-0.5B-Instruct-GGUF")
    filename = os.getenv("LOCAL_MODEL_FILE", "Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf")
    model_path = os.getenv("LOCAL_MODEL_PATH", "models/Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf")

    target_dir = os.path.dirname(os.path.abspath(model_path))
    os.makedirs(target_dir, exist_ok=True)

    print(f"Downloading {filename} (~180MB) from {repo_id}...")
    try:
        from huggingface_hub import hf_hub_download
        hf_hub_download(repo_id=repo_id, filename=filename,
                        local_dir=target_dir, local_dir_use_symlinks=False)
        print(f"Saved to {os.path.abspath(model_path)}")
    except ImportError:
        print("Run: pip install huggingface_hub")
        sys.exit(1)
    except Exception as e:
        print(f"Download failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_model()
