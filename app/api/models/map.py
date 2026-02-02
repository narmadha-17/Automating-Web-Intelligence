from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class MapRequest(BaseModel):
    url: str = Field(..., description="The root URL to begin the map.")
    instructions: Optional[str] = Field(None, description="Natural language instructions for the mapper.")
    max_depth: Optional[int] = Field(1, ge=1, le=5, description="Max depth of the map (1-5).")
    max_breadth: Optional[int] = Field(50, ge=1, le=500, description="Max number of links to follow per level (1-500).")
    limit: Optional[int] = Field(10, ge=1, description="Total number of links the mapper will process before stopping.")
    select_paths: Optional[List[str]] = Field(None, description="Regex patterns to select only URLs with specific path patterns.")
    select_domains: Optional[List[str]] = Field(None, description="Regex patterns to select mapping to specific domains or subdomains.")
    exclude_paths: Optional[List[str]] = Field(None, description="Regex patterns to exclude URLs with specific path patterns.")
    exclude_domains: Optional[List[str]] = Field(None, description="Regex patterns to exclude specific domains or subdomains.")
    allow_external: bool = Field(False, description="Whether to include external domain links in the final results list.")
    include_images: bool = Field(False, description="Whether to include images in the map results.")
    extract_depth: Literal["basic", "advanced"] = Field("basic", description="Extraction depth.")
    format: Literal["markdown", "text"] = Field("markdown", description="The format of the extracted web page content.")
    timeout: Optional[int] = Field(60, ge=10, le=150, description="Maximum time in seconds to wait for the map operation.")
    include_usage: bool = Field(False, description="Whether to include usage information in the response.")
   

class MapResponse(BaseModel):
    base_url: Optional[str] = Field(None, description="The base URL of the map")
    results: List[str] = Field(default_factory=list, description="List of URL of the extracted content")
    response_time: Optional[float] = Field(None, description="Total time taken for the map")
    usage: Optional[Dict[str, Any]] = Field(None, description="API credit usage for this request")
    request_id: Optional[str] = Field(None, description="Unique request ID from Tavily")
