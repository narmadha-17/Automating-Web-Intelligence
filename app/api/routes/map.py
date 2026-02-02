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
        url = map_params.pop("url")
        instructions = map_params.pop("instructions", None)
        max_depth = map_params.pop("max_depth", 1)
        max_breadth = map_params.pop("max_breadth", 50)
        limit = map_params.pop("limit", 10)

        results = await tavily_service.map(
            url=url,
            instructions=instructions,
            max_depth=max_depth,
            max_breadth=max_breadth,
            limit=limit,
            **map_params
        )
        
        try:
            await mongodb_service.save_map_results(results)
            logger.info(f"Stored map results for {request.url} in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to save map results to MongoDB: {e}")
            
        return results
        
    except Exception as e:
        handle_api_error(e, context="map")
