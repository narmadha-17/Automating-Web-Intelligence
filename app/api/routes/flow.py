from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.flow_service import flow_generation_service

router = APIRouter()


class FlowRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt describing the workflow")


class FlowResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


@router.post(
    "/generate",
    response_model=FlowResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a workflow graph from a prompt",
    description="Create a node/edge workflow description from the provided prompt using the flow generation service.",
)
async def generate_flow(request: FlowRequest) -> FlowResponse:
    try:
        result = await flow_generation_service.generate_flow(request.prompt)
        return FlowResponse(**result)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate flow: {str(exc)}",
        ) from exc
