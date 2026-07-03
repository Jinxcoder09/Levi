import os
import sys

def download_model():
    # Read settings from environment variables or use default
    repo_id = os.getenv("LOCAL_MODEL_REPO", "bartowski/Qwen2.5-Coder-0.5B-Instruct-GGUF")
    filename = os.getenv("LOCAL_MODEL_FILE", "Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf")
    model_path = os.getenv("LOCAL_MODEL_PATH", "models/Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf")
    
    target_dir = os.path.dirname(os.path.abspath(model_path))
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"============================================================")
    print(f"Starting Qwen GGUF model downloader...")
    print(f"Source HF Repo: {repo_id}")
    print(f"Target Filename: {filename}")
    print(f"Destination Dir: {target_dir}")
    print(f"============================================================")
    
    try:
        from huggingface_hub import hf_hub_download
        
        print("Downloading GGUF file (approx. 397MB)...")
        hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=target_dir,
            local_dir_use_symlinks=False
        )
        print("Model file downloaded successfully!")
        print(f"Located at: {os.path.abspath(model_path)}")
    except ImportError:
        print("Error: 'huggingface_hub' package is not installed. Please run: pip install huggingface_hub")
        sys.exit(1)
    except Exception as e:
        print(f"Error downloading model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_model()
