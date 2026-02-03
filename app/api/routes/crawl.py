from fastapi import APIRouter, HTTPException, status
from typing import Any
import logging

from app.api.models.crawl import CrawlRequest, CrawlResponse
from app.services.tavily_service import tavily_service
from app.services.mongodb_service import mongodb_service
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
        
        crawl_data = await tavily_service.crawl(
            url=request.url,
            instructions=request.instructions,
            max_depth=request.max_depth,
            max_breadth=request.max_breadth,
            limit=request.limit,
            api_key=request.api_key,
            include_images=request.include_images,
            extract_depth=request.extract_depth,
            format=request.format,
            include_favicon=request.include_favicon,
            timeout=request.timeout
        )
        
        try:
            await mongodb_service.save_crawl_results(crawl_data)
            logger.info(f"Stored crawl results for {request.url} in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to save crawl results to MongoDB: {e}")
            
        return crawl_data
        
    except Exception as e:
        handle_api_error(e, context="crawl")
