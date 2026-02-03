from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import logging

from app.api.models.extract import ExtractRequest, ExtractResponse
from app.services.tavily_service import tavily_service
from app.services.mongodb_service import mongodb_service
from app.api.errors import handle_api_error

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/",
    response_model=ExtractResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract content from URLs",
    description="""
    Extract precise content from specific URLs using Tavily API.
    
    - Accepts a list of up to 20 URLs
    - Returns structured extraction results for each URL
    - Supports basic and advanced extraction depths
    - Can include an AI-generated answer based on the extracted content
    """,
    response_description="Extracted content and summary"
)
async def extract(request: ExtractRequest) -> ExtractResponse:
    try:
        logger.info(f"Received extraction request for {len(request.urls)} URLs")
        
        extract_data = await tavily_service.extract(
            urls=request.urls,
            query=request.query,
            extract_depth=request.extract_depth,
            include_images=request.include_images,
            include_answer=request.include_answer
        )
        
        results = extract_data.get("results", [])
        failed_results = extract_data.get("failed_results", [])
        
        logger.info(f"Extraction successful for {len(results)} URLs, failed for {len(failed_results)} URLs")
        
        if results:
            try:
                storage_results = []
                for res in results:
                    storage_res = res.copy()
                    storage_res["type"] = "extraction"
                    storage_res["requested_query"] = request.query
                    storage_results.append(storage_res)
                
                await mongodb_service.insert_batch_results(storage_results)
                logger.info(f"Stored {len(results)} extraction results in MongoDB")
            except Exception as e:
                logger.error(f"Failed to store extraction results in MongoDB: {e}")
        
        response = ExtractResponse(
            results=results,
            answer=extract_data.get("answer"),
            failed_results=failed_results,
            summary={
                "total": len(request.urls),
                "successful": len(results),
                "failed": len(failed_results)
            }
        )
        
        return response
        
    except Exception as e:
        handle_api_error(e, context="extract")
