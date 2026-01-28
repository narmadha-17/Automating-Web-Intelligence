from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from datetime import datetime
from app.api.utils import validate_non_empty_list


class SearchRequest(BaseModel):
    queries: List[str] = Field(
        ...,
        min_length=1,
        description="List of search queries (at least one required)",
        examples=[["Latest AI developments in 2026"]]
    )
    search_depth: Literal["basic", "advanced"] = Field(
        default="advanced",
        description="Search depth: 'basic' for quick results, 'advanced' for comprehensive search"
    )
    max_results: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum number of results per query (1-20)"
    )
    include_answer: bool = Field(
        default=True,
        description="Whether to include AI-generated answer"
    )
    
    @field_validator('queries')
    @classmethod
    def validate_queries(cls, v: List[str]) -> List[str]:
        return validate_non_empty_list(v, "query")
    
    class Config:
        json_schema_extra = {
            "example": {
                "queries": [
                    "Latest AI developments in 2026",
                    "Python FastAPI best practices"
                ],
                "search_depth": "advanced",
                "max_results": 5,
                "include_answer": True
            }
        }


class SearchResultItem(BaseModel):

    title: str = Field(..., description="Title of the search result")
    url: str = Field(..., description="URL of the search result")
    content: str = Field(..., description="Content/snippet of the search result")
    score: float = Field(default=0.0, description="Relevance score")
    published_date: Optional[str] = Field(None, description="Published date if available")


class SearchMetadata(BaseModel):

    search_depth: str
    result_count: int
    searched_at: datetime


class SingleSearchResult(BaseModel):

    query: str = Field(..., description="The search query")
    answer: str = Field(..., description="AI-generated answer")
    results: List[SearchResultItem] = Field(
        default_factory=list,
        description="List of search results"
    )
    search_metadata: SearchMetadata


class SearchSummary(BaseModel):
    total: int = Field(..., description="Total number of queries")
    successful: int = Field(..., description="Number of successful searches")
    failed: int = Field(..., description="Number of failed searches")


class SearchError(BaseModel):

    query: str = Field(..., description="Query that failed")
    error: str = Field(..., description="Error message")


class SearchResponse(BaseModel):

    results: List[SingleSearchResult] = Field(
        default_factory=list,
        description="List of search results for each query"
    )
    errors: List[SearchError] = Field(
        default_factory=list,
        description="List of errors for failed queries"
    )
    summary: SearchSummary = Field(..., description="Summary of the search operation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "results": [
                    {
                        "query": "Latest AI developments in 2026",
                        "answer": "In 2026, AI has seen significant advancements...",
                        "results": [
                            {
                                "title": "AI Trends 2026",
                                "url": "https://example.com/ai-trends",
                                "content": "Overview of AI trends...",
                                "score": 0.95,
                                "published_date": "2026-01-15"
                            }
                        ],
                        "search_metadata": {
                            "search_depth": "advanced",
                            "result_count": 5,
                            "searched_at": "2026-01-27T09:00:00Z"
                        }
                    }
                ],
                "errors": [],
                "summary": {
                    "total": 1,
                    "successful": 1,
                    "failed": 0
                }
            }
        }
