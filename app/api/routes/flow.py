from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import logging

from app.services.flow_service import flow_generation_service

logger = logging.getLogger(__name__)

router = APIRouter()

class FlowGenerationRequest(BaseModel):
    prompt: str

class FlowGenerationResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

@router.post("/generate",
    response_model=FlowGenerationResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a data flow from a prompt",
    description="Uses AI to translate a natural language prompt into a sequence of tool nodes and connections."
)
async def generate_flow(request: FlowGenerationRequest) -> FlowGenerationResponse:
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Prompt cannot be empty"
            )
        
        logger.info(f"Received flow generation request for: {request.prompt}")
        flow = await flow_generation_service.generate_flow(request.prompt)
        
        # Validate the response structure
        if not isinstance(flow, dict):
            logger.error(f"Invalid flow structure: {type(flow)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Flow generation returned invalid structure"
            )
        
        if "nodes" not in flow or "edges" not in flow:
            logger.error(f"Missing nodes or edges in flow: {flow}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Flow generation returned incomplete structure"
            )
        
        logger.info(f"Successfully generated flow with {len(flow['nodes'])} nodes and {len(flow['edges'])} edges")
        return FlowGenerationResponse(nodes=flow["nodes"], edges=flow["edges"])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in flow generation endpoint: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Flow generation failed: {str(e)}"
        )
