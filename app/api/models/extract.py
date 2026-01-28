from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime
from app.api.utils import validate_non_empty_list

class ExtractRequest(BaseModel):
    urls: List[str] = Field(
        ...,
        min_length=1,
        max_length=20,
        description="List of URLs to extract content from (1-20 URLs)"
    )
    query: Optional[str] = Field(
        None,
        description="Optional search query to help find relevant content on the pages"
    )
    extract_depth: Literal["basic", "advanced"] = Field(
        default="basic",
        description="Extraction depth: 'basic' for faster processing, 'advanced' for more comprehensive extraction"
    )
    include_images: bool = Field(
        default=False,
        description="Whether to include extracted images"
    )
    include_answer: bool = Field(
        default=False,
        description="Whether to include an AI-generated answer based on the extracted content"
    )

    @field_validator('urls')
    @classmethod
    def validate_urls(cls, v: List[str]) -> List[str]:
        return validate_non_empty_list(v, "URL")

class ExtractResultItem(BaseModel):
    url: str = Field(..., description="URL of the extracted content")
    title: Optional[str] = Field(None, description="Title of the page")
    content: Optional[str] = Field(None, description="Extracted content")
    raw_content: Optional[str] = Field(None, description="Raw content if available")
    images: Optional[List[str]] = Field(default_factory=list, description="List of extracted images")

class ExtractResponse(BaseModel):
    results: List[ExtractResultItem] = Field(
        default_factory=list,
        description="List of extraction results for each URL"
    )
    answer: Optional[str] = Field(None, description="AI-generated answer if requested")
    failed_results: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of URLs that failed to extract and their error messages"
    )
    summary: Dict[str, Any] = Field(..., description="Summary of the extraction operation")
