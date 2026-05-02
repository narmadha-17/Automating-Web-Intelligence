from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api.routes import search, extract, crawl, map, beautify, flow, qa
from app.services.mongodb_service import MongoDBService
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up FastAPI application...")
    logger.info("OpenAI API Integration Active")

    mongodb_service = None
    try:
        mongodb_service = MongoDBService()
        await mongodb_service.connect()
        logger.info("MongoDB connection established")
        app.state.mongodb_service = mongodb_service
    except Exception as e:
        logger.warning(f"Failed to connect to MongoDB: {e}. Flow generation will still work with heuristic fallback.")
        app.state.mongodb_service = None

    yield

    logger.info("Shutting down FastAPI application...")
    if mongodb_service:
        try:
            await mongodb_service.close()
            logger.info("MongoDB connection closed")
        except Exception as e:
            logger.error(f"Error closing MongoDB connection: {e}")


app = FastAPI(
    title="Web Intelligence API",
    description="""
    Advanced web intelligence platform powered by OpenAI.

    **Key Features:**
    - OpenAI powered query analysis and semantic understanding
    - Intelligent content synthesis
    - AI-powered web search and extraction
    - MongoDB storage and management
    - Real-time data mapping and beautification
    """,
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/web_search", tags=["Search"])
app.include_router(extract.router, prefix="/extract", tags=["Extract"])
app.include_router(crawl.router, prefix="/crawl", tags=["Crawl"])
app.include_router(map.router, prefix="/map", tags=["Map"])
app.include_router(beautify.router, prefix="/beautify", tags=["Beautify"])
app.include_router(flow.router, prefix="/flow", tags=["Flow"])
app.include_router(qa.router, prefix="/qa", tags=["QA"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Web Intelligence API",
        "version": "3.0.0",
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Web Intelligence API",
        "version": "3.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
