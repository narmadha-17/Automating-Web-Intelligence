from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List
import logging

from app.services.beautify_service import beautify_service

logger = logging.getLogger(__name__)

router = APIRouter()

class BeautifyRequest(BaseModel):
    queries: List[str]

class BeautifyResponse(BaseModel):
    corrected_queries: List[str]

@router.post("/correct",
    response_model=BeautifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Beautify/Correct search queries",
    description="Automatically corrects spelling mistakes in the provided search queries."
)
async def correct_queries(request: BeautifyRequest) -> BeautifyResponse:
    try:
        logger.info(f"Beautifying {len(request.queries)} queries")
        corrected = beautify_service.batch_correct(request.queries)
        return BeautifyResponse(corrected_queries=corrected)
    except Exception as e:
        logger.error(f"Error in beautify endpoint: {str(e)}")
        # If correction fails, return original queries rather than failing hard
        return BeautifyResponse(corrected_queries=request.queries)
