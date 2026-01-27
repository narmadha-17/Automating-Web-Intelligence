from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "Web Intelligence API"
    VERSION: str = "2.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    CORS_ORIGINS: str = "*"
    
    @property
    def cors_origins_list(self) -> list:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    TAVILY_API_KEY: str
    TAVILY_BASE_URL: str = "https://api.tavily.com"
    TAVILY_TIMEOUT: int = 30
    TAVILY_MAX_RESULTS: int = 5
    TAVILY_SEARCH_DEPTH: str = "advanced"
    
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "web_intelligence"
    MONGODB_COLLECTION: str = "search_results"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
