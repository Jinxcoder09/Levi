from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PORT: int = Field(default=8000)
    HOST: str = Field(default="0.0.0.0")
    DEBUG: bool = Field(default=False)

    LOCAL_MODEL_PATH: str = Field(default="models/Qwen2.5-Coder-0.5B-Instruct-Q4_K_M.gguf")

    DEFAULT_TEMPERATURE: float = Field(default=0.7)
    DEFAULT_MAX_TOKENS: int = Field(default=512)
    DEFAULT_TOP_P: float = Field(default=0.9)
    DEFAULT_CONTEXT_LENGTH: int = Field(default=512)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
