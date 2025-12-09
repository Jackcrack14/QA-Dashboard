import os
from pydantic_settings import BaseSettings
from typing import List, Any
from pydantic import field_validator
import json

class Settings(BaseSettings):
    project_name: str = "Founder QA"
    database_url: str = "sqlite:///./sql_app.db"
    secret_key: str = "default-insecure-key"
    api_v1_str: str = "/api/v1"
    
    
    cors_origins: List[str] = []

    
    @field_validator("cors_origins", mode="before")
    def assemble_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()