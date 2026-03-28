from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

from app.services.openai_service import get_openai_service

logger = logging.getLogger(__name__)

router = APIRouter()

class QARequest(BaseModel):
    question: str
    context: str = ""
    api_key: Optional[str] = None

class QAResponse(BaseModel):
    answer: str
    question: str
    powered_by: str = "OpenAI API"
    status: str = "success"

@router.post("/ask",
    response_model=QAResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question using OpenAI",
    description="""
    Use OpenAI to answer a question based on provided context.
    
    This powers the QA node in the Dashboard flow, using OpenAI as
    a genuine thinking engine to synthesize answers from web intelligence data.
    """
)
async def ask_question(request: QARequest) -> QAResponse:
    """Answer a question using OpenAI with optional context from upstream nodes."""
    try:
        logger.info(f"QA request: '{request.question[:100]}'")
        
        openai_svc = get_openai_service()
        
        # If no context provided, use a default
        context = request.context or "No additional context provided. Answer based on your general knowledge."
        
        result = await openai_svc.ask_question(
            question=request.question,
            context=context,
            api_key=request.api_key
        )
        
        return QAResponse(
            answer=result["answer"],
            question=result["question"],
            powered_by=result.get("powered_by", "OpenAI API")
        )
        
    except ValueError as e:
        logger.error(f"QA error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenAI QA failed: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected QA error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"QA failed: {str(e)}"
        )
