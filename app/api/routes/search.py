from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import logging

from app.api.models.search import (
    SearchRequest,
    SearchResponse,
    SingleSearchResult,
    SearchError,
    SearchSummary
)
from app.services.tavily_service import tavily_service
from app.services.mongodb_service import mongodb_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Perform web search",
    description="""
    Perform AI-powered web search using Tavily API.
    
    - Accepts one or more search queries
    - Returns AI-generated answers and search results
    - Automatically stores results in MongoDB
    - Supports both basic and advanced search depths
    - Validates all inputs using Pydantic models
    """,
    response_description="Search results with AI-generated answers"
)
async def search(request: SearchRequest) -> SearchResponse:
    """
    Main search endpoint: /web_search/search
    
    Performs web intelligence gathering with the following features:
    - Batch processing of multiple queries
    - AI-powered search via Tavily API
    - Automatic MongoDB storage
    - Comprehensive error handling
    - Request validation
    
    Args:
        request: SearchRequest model with validated queries and options
        
    Returns:
        SearchResponse with results, errors, and summary
        
    Raises:
        HTTPException: If critical errors occur during search
    """
    try:
        logger.info(f"Received search request with {len(request.queries)} queries")
        
        # Perform batch search using Tavily service
        search_data = await tavily_service.batch_search(
            queries=request.queries,
            search_depth=request.search_depth,
            max_results=request.max_results,
            include_answer=request.include_answer
        )
        
        # Store successful results in MongoDB
        if search_data["results"]:
            try:
                await mongodb_service.insert_batch_results(search_data["results"])
                logger.info(f"Stored {len(search_data['results'])} results in MongoDB")
            except Exception as e:
                # Log error but don't fail the request
                logger.error(f"Failed to store results in MongoDB: {e}")
        
        # Build response using Pydantic models
        response = SearchResponse(
            results=[
                SingleSearchResult(**result)
                for result in search_data["results"]
            ],
            errors=[
                SearchError(**error)
                for error in search_data["errors"]
            ],
            summary=SearchSummary(**search_data["summary"])
        )
        
        logger.info(
            f"Search completed: {response.summary.successful} successful, "
            f"{response.summary.failed} failed"
        )
        
        return response
        
    except ValueError as e:
        # Handle validation and API errors
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error in search endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.get(
    "/results",
    summary="Get recent search results",
    description="Retrieve recent search results from MongoDB",
    response_description="List of recent search results"
)
async def get_results(limit: int = 10) -> Dict[str, Any]:
    """
    Retrieve recent search results from database
    
    Args:
        limit: Maximum number of results to retrieve (default: 10)
        
    Returns:
        Dictionary with results list
        
    Raises:
        HTTPException: If database query fails
    """
    try:
        if limit < 1 or limit > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be between 1 and 100"
            )
        
        results = await mongodb_service.get_all_results(limit=limit)
        
        return {
            "count": len(results),
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving results: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve results: {str(e)}"
        )


@router.get(
    "/stats",
    summary="Get search statistics",
    description="Get statistics about stored search results",
    response_description="Statistics including total and recent result counts"
)
async def get_stats() -> Dict[str, Any]:
    """
    Get database statistics
    
    Returns:
        Dictionary with statistics
        
    Raises:
        HTTPException: If database query fails
    """
    try:
        stats = await mongodb_service.get_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Error retrieving stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )
