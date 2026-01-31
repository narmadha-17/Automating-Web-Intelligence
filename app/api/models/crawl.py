from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime

class CrawlRequest(BaseModel):
    url: str = Field(..., description="The root URL to begin the crawl.")
    instructions: Optional[str] = Field(None, description="Natural language instructions for the crawler.")
    max_depth: Optional[int] = Field(1, ge=1, le=5, description="Max depth of the crawl (1-5).")
    max_breadth: Optional[int] = Field(50, ge=1, le=500, description="Max number of links to follow per level (1-500).")
    limit: Optional[int] = Field(10, ge=1, description="Total number of links the crawler will process before stopping.")
    select_paths: Optional[List[str]] = Field(None, description="Regex patterns to select only URLs with specific path patterns.")
    select_domains: Optional[List[str]] = Field(None, description="Regex patterns to select crawling to specific domains or subdomains.")
    exclude_paths: Optional[List[str]] = Field(None, description="Regex patterns to exclude URLs with specific path patterns.")
    exclude_domains: Optional[List[str]] = Field(None, description="Regex patterns to exclude specific domains or subdomains.")
    allow_external: bool = Field(False, description="Whether to include external domain links in the final results list.")
    include_images: bool = Field(False, description="Whether to include images in the crawl results.")
    extract_depth: Literal["basic", "advanced"] = Field("basic", description="Extraction depth.")
    format: Literal["markdown", "text"] = Field("markdown", description="The format of the extracted web page content.")
    include_favicon: bool = Field(False, description="Whether to include the favicon URL for each result.")
    timeout: Optional[int] = Field(60, ge=10, le=150, description="Maximum time in seconds to wait for the crawl operation.")

class CrawlResultItem(BaseModel):
    url: str = Field(..., description="URL of the extracted content")
    title: Optional[str] = Field(None, description="Title of the page")
    content: Optional[str] = Field(None, description="Extracted content")
    raw_content: Optional[str] = Field(None, description="Raw content if available")
    images: Optional[List[str]] = Field(default_factory=list, description="List of extracted images")
    favicon: Optional[str] = Field(None, description="Favicon URL")

class CrawlResponse(BaseModel):
    base_url: Optional[str] = Field(None, description="The base URL of the crawl")
    results: List[CrawlResultItem] = Field(default_factory=list, description="List of crawl results")
    response_time: Optional[float] = Field(None, description="Total time taken for the crawl")
    usage: Optional[Dict[str, Any]] = Field(None, description="API credit usage for this request")
    request_id: Optional[str] = Field(None, description="Unique request ID from Tavily")
