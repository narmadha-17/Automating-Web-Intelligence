from pydantic_settings import BaseSettings


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

    TAVILY_API_KEY: str | None = None
    TAVILY_BASE_URL: str = "https://api.tavily.com"
    TAVILY_TIMEOUT: int = 30
    TAVILY_MAX_RESULTS: int = 5
    TAVILY_SEARCH_DEPTH: str = "advanced"

    OPENAI_API_KEY: str | None = None
    OPENAI_API_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TIMEOUT: int = 60

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "web_intelligence"
    MONGODB_COLLECTION: str = "search_results"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
