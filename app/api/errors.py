from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)

def handle_api_error(e: Exception, context: str = "endpoint"):
    if isinstance(e, ValueError):
        logger.error(f"Validation error in {context}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    if isinstance(e, HTTPException):
        raise e
        
    logger.error(f"Unexpected error in {context}: {str(e)}", exc_info=True)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Internal server error: {str(e)}"
    )
