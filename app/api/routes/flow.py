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
        logger.info(f"Received flow generation request for: {request.prompt}")
        flow = await flow_generation_service.generate_flow(request.prompt)
        return FlowGenerationResponse(**flow)
    except Exception as e:
        logger.error(f"Error in flow generation endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
