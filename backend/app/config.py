import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # LLM Settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Bhashini API Settings
    BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    BHASHINI_PIPELINE_ENDPOINT: str = os.getenv(
        "BHASHINI_PIPELINE_ENDPOINT",
        "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
    )
    BHASHINI_INFERENCE_API_KEY: str = os.getenv("BHASHINI_INFERENCE_API_KEY", "")
    
    # Data Storage
    DATA_STORAGE_MODE: str = os.getenv("DATA_STORAGE_MODE", "local")
    DATA_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data"))

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
