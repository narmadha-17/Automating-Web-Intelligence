import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.core.config import settings

logger = logging.getLogger(__name__)


class TavilyService:
    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY
        self.base_url = settings.TAVILY_BASE_URL
        self.timeout = settings.TAVILY_TIMEOUT
        self.max_results = settings.TAVILY_MAX_RESULTS
        self.search_depth = settings.TAVILY_SEARCH_DEPTH
        
        if not self.api_key:
            logger.warning("TAVILY_API_KEY not set in environment variables")
    
    async def search(
        self,
        query: str,
        search_depth: Optional[str] = None,
        max_results: Optional[int] = None,
        include_answer: bool = True,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:

        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError("Tavily API key is not configured. Please provide one or set it in your .env file")
        
        logger.info(f"Searching Tavily for: '{query}'")
        
        payload = {
            "api_key": active_key,
            "query": query,
            "search_depth": search_depth or self.search_depth,
            "max_results": max_results or self.max_results,
            "include_answer": include_answer,
            "include_raw_content": False,
            "include_images": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {active_key}"
                }
                response = await client.post(
                    f"{self.base_url}/search",
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                
                data = response.json()
                result_count = len(data.get("results", []))
                logger.info(f"Found {result_count} results for: '{query}'")
                
                return self._format_response(query, data, search_depth or self.search_depth)
                
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            
            if status_code == 401:
                error_msg = "Invalid Tavily API key. Please check your TAVILY_API_KEY in .env file"
            elif status_code == 429:
                error_msg = "Rate limit exceeded. Please wait before making more requests"
            else:
                error_msg = f"Tavily API error ({status_code}): {e.response.text}"
            
            logger.error(f"HTTP error for query '{query}': {error_msg}")
            raise ValueError(error_msg)
            
        except httpx.RequestError as e:
            error_msg = f"Request error: {str(e)}"
            logger.error(f"Request error for query '{query}': {error_msg}")
            raise ValueError(error_msg)
            
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(f"Unexpected error for query '{query}': {error_msg}")
            raise ValueError(error_msg)


    async def extract(
        self,
        urls: list[str],
        query: Optional[str] = None,
        extract_depth: Optional[str] = None,
        include_images: bool = False,
        include_answer: bool = False,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError("Tavily API key is not configured. Please provide one or set it in your .env file")
        
        logger.info(f"Extracting content from {len(urls)} URLs")
        
        payload = {
            "api_key": active_key,
            "urls": urls,
            "query": query,
            "extract_depth": extract_depth or "basic",
            "include_images": include_images,
            "include_answer": include_answer
        }
        
        payload = {k: v for k, v in payload.items() if v is not None}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {active_key}"
                }
                response = await client.post(
                    f"{self.base_url}/extract",
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                
                data = response.json()
                result_count = len(data.get("results", []))
                logger.info(f"Successfully extracted content from {result_count} URLs")
                
                return data
                
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            if status_code == 401:
                error_msg = "Invalid Tavily API key."
            elif status_code == 429:
                error_msg = "Rate limit exceeded."
            else:
                error_msg = f"Tavily API error ({status_code}): {e.response.text}"
            
            logger.error(f"HTTP error during extraction: {error_msg}")
            raise ValueError(error_msg)
            
        except httpx.RequestError as e:
            error_msg = f"Request error: {str(e)}"
            logger.error(f"Request error during extraction: {error_msg}")
            raise ValueError(error_msg)
            
        except Exception as e:
            error_msg = f"Unexpected error during extraction: {str(e)}"
            logger.error(f"Unexpected error during extraction: {error_msg}")
            raise ValueError(error_msg)
    
    async def crawl(
        self,
        url: str,
        instructions: Optional[str] = None,
        max_depth: Optional[int] = 1,
        max_breadth: Optional[int] = 50,
        limit: Optional[int] = 10,
        api_key: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError("Tavily API key is not configured. Please provide one or set it in your .env file")
        
        logger.info(f"Crawling URL: {url} with instructions: {instructions}")
        
        payload = {
            "api_key": active_key,
            "url": url,
            "instructions": instructions,
            "max_depth": max_depth,
            "max_breadth": max_breadth,
            "limit": limit,
            **kwargs
        }
        
        payload = {k: v for k, v in payload.items() if v is not None}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {active_key}"
                }
                response = await client.post(
                    f"{self.base_url}/crawl",
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                
                data = response.json()
                result_count = len(data.get("results", []))
                logger.info(f"Successfully crawled and found {result_count} items")
                
                return data
                
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            response_text = e.response.text
            logger.error(f"Tavily API returned status {status_code}: {response_text}")
            
            if status_code == 401:
                error_msg = f"Invalid Tavily API key: {response_text}"
            elif status_code == 429:
                error_msg = "Rate limit exceeded."
            else:
                error_msg = f"Tavily API error ({status_code}): {response_text}"
            
            logger.error(f"HTTP error during crawl: {error_msg}")
            raise ValueError(error_msg)
            
        except httpx.RequestError as e:
            error_msg = f"Request error: {str(e)}"
            logger.error(f"Request error during crawl: {error_msg}")
            raise ValueError(error_msg)
            
        except Exception as e:
            error_msg = f"Unexpected error during crawl: {str(e)}"
            logger.error(f"Unexpected error during crawl: {error_msg}")
            raise ValueError(error_msg)

    async def map(
        self,
        url: str,
        instructions: Optional[str] = None,
        max_depth: Optional[int] = 1,
        max_breadth: Optional[int] = 50,
        limit: Optional[int] = 10,
        api_key: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError("Tavily API key is not configured. Please provide one or set it in your .env file")
        
        logger.info(f"Mapping URL: {url} with instructions: {instructions}")
        
        payload = {
            "api_key": active_key,
            "url": url,
            "instructions": instructions,
            "max_depth": max_depth,
            "max_breadth": max_breadth,
            "limit": limit,
            **kwargs
        }
        
        payload = {k: v for k, v in payload.items() if v is not None}
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {active_key}"
                }
                response = await client.post(
                    f"{self.base_url}/map",
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                
                data = response.json()
                result_count = len(data.get("results", []))
                logger.info(f"Successfully mapped and found {result_count} items")
                
                return data
                
        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            response_text = e.response.text
            logger.error(f"Tavily API returned status {status_code}: {response_text}")
            
            if status_code == 401:
                error_msg = f"Invalid Tavily API key: {response_text}"
            elif status_code == 429:
                error_msg = "Rate limit exceeded."
            else:
                error_msg = f"Tavily API error ({status_code}): {response_text}"
            
            logger.error(f"HTTP error during map: {error_msg}")
            raise ValueError(error_msg)
            
        except httpx.RequestError as e:
            error_msg = f"Request error: {str(e)}"
            logger.error(f"Request error during map: {error_msg}")
            raise ValueError(error_msg)
            
        except Exception as e:
            error_msg = f"Unexpected error during map: {str(e)}"
            logger.error(f"Unexpected error during map: {error_msg}")
            raise ValueError(error_msg)


    async def batch_search(
        self,
        queries: list[str],
        search_depth: Optional[str] = None,
        max_results: Optional[int] = None,
        include_answer: bool = True,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:

        results = []
        errors = []
        
        logger.info(f"Starting batch search for {len(queries)} queries")
        
        for i, query in enumerate(queries, 1):
            try:
                logger.info(f"[{i}/{len(queries)}] Processing: '{query}'")
                result = await self.search(query, search_depth, max_results, include_answer, api_key)
                results.append(result)
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Error searching '{query}': {error_msg}")
                errors.append({
                    "query": query,
                    "error": error_msg
                })
        
        logger.info(f"Batch search complete: {len(results)} successful, {len(errors)} failed")
        
        return {
            "results": results,
            "errors": errors,
            "summary": {
                "total": len(queries),
                "successful": len(results),
                "failed": len(errors)
            }
        }
    
    def _format_response(self, query: str, data: Dict[str, Any], search_depth: str) -> Dict[str, Any]:

        results = data.get("results", [])
        
        formatted_results = [
            {
                "title": result.get("title", ""),
                "url": result.get("url", ""),
                "content": result.get("content", ""),
                "score": result.get("score", 0.0),
                "published_date": result.get("published_date")
            }
            for result in results
        ]
        
        return {
            "query": query,
            "answer": data.get("answer", "No AI answer provided"),
            "results": formatted_results,
            "search_metadata": {
                "search_depth": search_depth,
                "result_count": len(formatted_results),
                "searched_at": datetime.utcnow()
            }
        }

tavily_service = TavilyService()
