from fastapi import APIRouter, HTTPException, status
from typing import Any
import logging

from app.api.models.crawl import CrawlRequest, CrawlResponse
from app.services.tavily_service import tavily_service
from app.services.mongodb_service import MongoDBService
from app.api.errors import handle_api_error

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/",
    response_model=CrawlResponse,
    status_code=status.HTTP_200_OK,
    summary="Crawl a website",
    description="""
    Perform a graph-based website traversal using Tavily Crawl.
    
    - Explores paths in parallel with built-in extraction
    - Supports natural language instructions
    - Customizable depth and breadth
    """
)
async def crawl(request: CrawlRequest) -> Any:
    try:
        logger.info(f"Received crawl request for URL: {request.url}")
        
        crawl_params = request.model_dump(exclude_none=True)
        url = crawl_params.pop("url")
        instructions = crawl_params.pop("instructions", None)
        max_depth = crawl_params.pop("max_depth", 1)
        max_breadth = crawl_params.pop("max_breadth", 50)
        limit = crawl_params.pop("limit", 10)

        results = await tavily_service.crawl(
            url=url,
            instructions=instructions,
            max_depth=max_depth,
            max_breadth=max_breadth,
            limit=limit,
            **crawl_params
        )
        
        try:
            await mongodb_service.save_crawl_results(results)
            logger.info(f"Stored crawl results for {request.url} in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to save crawl results to MongoDB: {e}")
            
        return results
        
    except Exception as e:
        handle_api_error(e, context="crawl")
