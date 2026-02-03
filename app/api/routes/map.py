from fastapi import APIRouter, HTTPException, status
from typing import Any
import logging

from app.api.models.map import MapRequest, MapResponse
from app.services.tavily_service import tavily_service
from app.services.mongodb_service import mongodb_service
from app.api.errors import handle_api_error

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/",
    response_model=MapResponse,
    status_code=status.HTTP_200_OK,
    summary="Map a website",
    description="""
    Perform a graph-based website traversal using Tavily Map.
    
    - Explores paths in parallel with built-in extraction
    - Supports natural language instructions
    - Customizable depth and breadth
    """
)
async def map_website(request: MapRequest) -> Any:
    try:
        logger.info(f"Received map request for URL: {request.url}")
        
        map_params = request.model_dump(exclude_none=True)
        map_data = await tavily_service.map(
            url=request.url,
            instructions=request.instructions,
            max_depth=request.max_depth,
            max_breadth=request.max_breadth,
            limit=request.limit,
            api_key=request.api_key,
            include_images=request.include_images,
            extract_depth=request.extract_depth,
            format=request.format,
            timeout=request.timeout,
            include_usage=request.include_usage
        )
        
        try:
            await mongodb_service.save_map_results(map_data)
            logger.info(f"Stored map results for {request.url} in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to save map results to MongoDB: {e}")
            
        return map_data
        
    except Exception as e:
        handle_api_error(e, context="map")
