import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Server settings
    PORT: int = Field(default=8000, validation_alias="PORT")
    HOST: str = Field(default="0.0.0.0", validation_alias="HOST")
    DEBUG: bool = Field(default=False, validation_alias="DEBUG")
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://localhost:8000",
        validation_alias="CORS_ORIGINS"
    )

    # LLM Settings
    INFERENCE_MODE: str = Field(default="local", validation_alias="INFERENCE_MODE")

    # Local GGUF Settings
    LOCAL_MODEL_PATH: str = Field(
        default="models/SmolLM2-360M-Instruct-Q4_K_M.gguf",
        validation_alias="LOCAL_MODEL_PATH"
    )
    LOCAL_MODEL_REPO: str = Field(
        default="bartowski/SmolLM2-360M-Instruct-GGUF",
        validation_alias="LOCAL_MODEL_REPO"
    )
    LOCAL_MODEL_FILE: str = Field(
        default="SmolLM2-360M-Instruct-Q4_K_M.gguf",
        validation_alias="LOCAL_MODEL_FILE"
    )

    # Generation Defaults
    DEFAULT_TEMPERATURE: float = Field(default=0.7, validation_alias="DEFAULT_TEMPERATURE")
    DEFAULT_MAX_TOKENS: int = Field(default=1024, validation_alias="DEFAULT_MAX_TOKENS")
    DEFAULT_TOP_P: float = Field(default=0.9, validation_alias="DEFAULT_TOP_P")
    DEFAULT_CONTEXT_LENGTH: int = Field(default=2048, validation_alias="DEFAULT_CONTEXT_LENGTH")

    # Security / Limits
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, validation_alias="RATE_LIMIT_PER_MINUTE")
    SECRET_KEY: str = Field(
        default="dev-secret-key-must-be-changed-in-production-environments!",
        validation_alias="SECRET_KEY"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate singleton settings
settings = Settings()
