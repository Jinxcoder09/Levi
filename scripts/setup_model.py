import os
import sys
from huggingface_hub import hf_hub_download

def download_model():
    """Download the required model for the application."""
    try:
        print("Creating models directory...")
        os.makedirs('models', exist_ok=True)
        
        print("Downloading model from Hugging Face...")
        hf_hub_download(
            repo_id='HuggingFaceTB/SmolLM2-360M-Instruct-GGUF',
            filename='SmolLM2-360M-Instruct-Q4_K_M.gguf',
            local_dir='models',
            local_dir_use_symlinks=False
        )
        
        print("Model downloaded successfully!")
        return True
        
    except Exception as e:
        print(f"Error downloading model: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    success = download_model()
    sys.exit(0 if success else 1)
