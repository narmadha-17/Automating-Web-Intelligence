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
from app.services.asi_one_service import get_asi_service
from app.api.errors import handle_api_error

logger = logging.getLogger(__name__)
asi_service = get_asi_service()

router = APIRouter()


@router.post("/search",
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

    try:
        logger.info(f"Received search request with {len(request.queries)} queries")
        search_data = await tavily_service.batch_search(
            queries=request.queries,
            search_depth=request.search_depth,
            max_results=request.max_results,
            include_answer=request.include_answer,
            api_key=request.api_key
        )
        if search_data["results"]:
            try:
                await mongodb_service.insert_batch_results(search_data["results"])
                logger.info(f"Stored {len(search_data['results'])} results in MongoDB")
            except Exception as e:
                logger.error(f"Failed to store results in MongoDB: {e}")
        
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
        
    except Exception as e:
        handle_api_error(e, context="search")


@router.get("/results",
    summary="Get recent search results",
    description="Retrieve recent search results from MongoDB",
    response_description="List of recent search results"
)
async def get_results(limit: int = 10) -> Dict[str, Any]:
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


@router.get("/stats",
    summary="Get search statistics",
    description="Get statistics about stored search results",
    response_description="Statistics including total and recent result counts"
)
async def get_stats() -> Dict[str, Any]:
    try:
        stats = await mongodb_service.get_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Error retrieving stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve statistics: {str(e)}"
        )

@router.post("/search-with-asi",
    status_code=status.HTTP_200_OK,
    summary="Advanced search with ASI-1 analysis",
    description="""
    Perform web search with ASI-1 AI analysis.
    
    This endpoint leverages ASI:One as a genuine thinking partner to:
    - Analyze and refine search queries for better results
    - Synthesize information from multiple sources
    - Provide intelligent insights and recommendations
    
    **API Innovate 2026 Hackathon Integration**
    
    This is a core feature demonstrating genuine ASI-1 API usage
    for advanced web intelligence gathering.
    """,
    response_description="Search results enhanced with ASI-1 analysis"
)
async def search_with_asi(request: SearchRequest) -> Dict[str, Any]:
    """
    Advanced search endpoint integrating ASI-1 for enhanced intelligence.
    
    Uses ASI:One to understand search intent deeply and provide
    intelligent synthesis of results.
    """
    try:
        logger.info(f"Received ASI-enhanced search request with {len(request.queries)} queries")
        
        results_by_query = {}
        
        for query in request.queries:
            try:
                # Step 1: Use ASI-1 to analyze and enhance the query
                logger.info(f"Analyzing query with ASI-1: '{query}'")
                query_analysis = await asi_service.analyze_search_query(
                    query=query,
                    api_key=request.api_key
                )
                
                refined_query = query_analysis.get("refined_query", query)
                
                # Step 2: Perform web search with refined query
                logger.info(f"Performing web search with refined query: '{refined_query}'")
                search_data = await tavily_service.search(
                    query=refined_query,
                    search_depth=request.search_depth,
                    max_results=request.max_results,
                    include_answer=request.include_answer,
                    api_key=request.api_key
                )
                
                # Step 3: Use ASI-1 to synthesize results
                if search_data.get("results"):
                    logger.info(f"Synthesizing {len(search_data['results'])} results with ASI-1")
                    synthesis = await asi_service.synthesize_web_content(
                        search_results=search_data["results"],
                        query=query,
                        api_key=request.api_key
                    )
                else:
                    synthesis = {
                        "status": "success",
                        "synthesis": "No results to synthesize",
                        "key_insights": []
                    }
                
                results_by_query[query] = {
                    "query_analysis": query_analysis,
                    "search_results": search_data.get("results", []),
                    "answer": search_data.get("answer", ""),
                    "asi_synthesis": synthesis,
                    "status": "success"
                }
                
                # Store in MongoDB
                try:
                    await mongodb_service.insert_batch_results(
                        [{"query": query, **results_by_query[query]}]
                    )
                except Exception as e:
                    logger.warning(f"Failed to store results: {e}")
                    
            except Exception as e:
                logger.error(f"Error processing query '{query}': {str(e)}")
                results_by_query[query] = {
                    "status": "error",
                    "error": str(e)
                }
        
        return {
            "status": "success",
            "queries_processed": len(request.queries),
            "results": results_by_query,
            "note": "Results analyzed with ASI-1 API (API Innovate 2026 Hackathon)",
            "timestamp": logger.name
        }
        
    except Exception as e:
        logger.error(f"Error in ASI-enhanced search: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search with ASI analysis failed: {str(e)}"
        )


@router.post("/analyze-asi",
    status_code=status.HTTP_200_OK,
    summary="Analyze content with ASI-1",
    description="""
    Use ASI-1 to analyze and extract intelligence from web content.
    
    Demonstrates ASI:One's capability as a thinking engine for
    intelligent content analysis and extraction.
    """
)
async def analyze_with_asi(url: str, query: str = None) -> Dict[str, Any]:
    """Analyze a URL using ASI-1 as the analysis engine."""
    try:
        logger.info(f"Analyzing {url} with ASI-1")
        
        analysis = await asi_service.extract_and_analyze(
            url=url,
            query=query
        )
        
        return {
            "status": "success",
            "analysis": analysis,
            "powered_by": "ASI-1 API"
        }
        
    except Exception as e:
        logger.error(f"Error analyzing with ASI: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ASI analysis failed: {str(e)}"
        )
