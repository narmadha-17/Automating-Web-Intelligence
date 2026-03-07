"""Tests for app.services.tavily_service module."""

import pytest
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock
import httpx

from app.services.tavily_service import TavilyService


class TestTavilyServiceInit:
    """Tests for TavilyService initialization."""

    def test_service_initializes_with_defaults(self):
        """Test service initializes with default settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            
            service = TavilyService()
            
            assert service.api_key == "test-key"
            assert service.base_url == "https://api.tavily.com"
            assert service.timeout == 30
            assert service.max_results == 5
            assert service.search_depth == "advanced"


class TestTavilyServiceFormatResponse:
    """Tests for _format_response method."""

    @pytest.fixture
    def service(self):
        """Create a TavilyService with mocked settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            return TavilyService()

    def test_format_response_basic(self, service):
        """Test basic response formatting."""
        data = {
            "answer": "Test answer",
            "results": [
                {
                    "title": "Test Title",
                    "url": "https://example.com",
                    "content": "Test content",
                    "score": 0.95,
                    "published_date": "2024-01-01"
                }
            ]
        }
        
        result = service._format_response("test query", data, "advanced")
        
        assert result["query"] == "test query"
        assert result["answer"] == "Test answer"
        assert len(result["results"]) == 1
        assert result["results"][0]["title"] == "Test Title"
        assert result["results"][0]["url"] == "https://example.com"
        assert result["search_metadata"]["search_depth"] == "advanced"
        assert result["search_metadata"]["result_count"] == 1

    def test_format_response_no_answer(self, service):
        """Test formatting when no answer provided."""
        data = {
            "answer": None,
            "results": []
        }
        
        result = service._format_response("test", data, "basic")
        
        assert result["answer"] == "No AI answer provided"

    def test_format_response_empty_results(self, service):
        """Test formatting with empty results."""
        data = {
            "answer": "Answer",
            "results": []
        }
        
        result = service._format_response("test", data, "basic")
        
        assert result["results"] == []
        assert result["search_metadata"]["result_count"] == 0

    def test_format_response_missing_fields(self, service):
        """Test formatting handles missing result fields."""
        data = {
            "results": [
                {}  # Empty result object
            ]
        }
        
        result = service._format_response("test", data, "basic")
        
        assert result["results"][0]["title"] == ""
        assert result["results"][0]["url"] == ""
        assert result["results"][0]["content"] == ""
        assert result["results"][0]["score"] == 0.0
        assert result["results"][0]["published_date"] is None

    def test_format_response_includes_timestamp(self, service):
        """Test that response includes searched_at timestamp."""
        data = {"results": []}
        
        result = service._format_response("test", data, "basic")
        
        assert "searched_at" in result["search_metadata"]
        assert isinstance(result["search_metadata"]["searched_at"], datetime)


class TestTavilyServiceSearch:
    """Tests for search method."""

    @pytest.fixture
    def service(self):
        """Create a TavilyService with mocked settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            return TavilyService()

    @pytest.mark.asyncio
    async def test_search_raises_without_api_key(self):
        """Test search raises when no API key configured."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = None
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            
            service = TavilyService()
            
            with pytest.raises(ValueError) as exc_info:
                await service.search("test query")
            
            assert "API key is not configured" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_search_uses_provided_api_key(self, service):
        """Test search uses provided API key over default."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"results": [], "answer": "test"}
        mock_response.raise_for_status = MagicMock()
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_instance
            
            await service.search("test", api_key="custom-key")
            
            call_kwargs = mock_instance.post.call_args
            assert call_kwargs.kwargs["json"]["api_key"] == "custom-key"


class TestTavilyServiceExtract:
    """Tests for extract method."""

    @pytest.fixture
    def service(self):
        """Create a TavilyService with mocked settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            return TavilyService()

    @pytest.mark.asyncio
    async def test_extract_raises_without_api_key(self):
        """Test extract raises when no API key configured."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = None
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            
            service = TavilyService()
            
            with pytest.raises(ValueError) as exc_info:
                await service.extract(["https://example.com"])
            
            assert "API key is not configured" in str(exc_info.value)


class TestTavilyServiceCrawl:
    """Tests for crawl method."""

    @pytest.fixture
    def service(self):
        """Create a TavilyService with mocked settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            return TavilyService()

    @pytest.mark.asyncio
    async def test_crawl_raises_without_api_key(self):
        """Test crawl raises when no API key configured."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = None
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            
            service = TavilyService()
            
            with pytest.raises(ValueError) as exc_info:
                await service.crawl("https://example.com")
            
            assert "API key is not configured" in str(exc_info.value)


class TestTavilyServiceMap:
    """Tests for map method."""

    @pytest.fixture
    def service(self):
        """Create a TavilyService with mocked settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            return TavilyService()

    @pytest.mark.asyncio
    async def test_map_raises_without_api_key(self):
        """Test map raises when no API key configured."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = None
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            
            service = TavilyService()
            
            with pytest.raises(ValueError) as exc_info:
                await service.map("https://example.com")
            
            assert "API key is not configured" in str(exc_info.value)


class TestTavilyServiceBatchSearch:
    """Tests for batch_search method."""

    @pytest.fixture
    def service(self):
        """Create a TavilyService with mocked settings."""
        with patch('app.services.tavily_service.settings') as mock_settings:
            mock_settings.TAVILY_API_KEY = "test-key"
            mock_settings.TAVILY_BASE_URL = "https://api.tavily.com"
            mock_settings.TAVILY_TIMEOUT = 30
            mock_settings.TAVILY_MAX_RESULTS = 5
            mock_settings.TAVILY_SEARCH_DEPTH = "advanced"
            return TavilyService()

    @pytest.mark.asyncio
    async def test_batch_search_empty_queries(self, service):
        """Test batch_search with empty query list."""
        result = await service.batch_search([])
        
        assert result["results"] == []
        assert result["errors"] == []
        assert result["summary"]["total"] == 0
        assert result["summary"]["successful"] == 0
        assert result["summary"]["failed"] == 0

    @pytest.mark.asyncio
    async def test_batch_search_handles_errors(self, service):
        """Test batch_search handles individual query errors."""
        with patch.object(service, 'search', side_effect=ValueError("API error")):
            result = await service.batch_search(["query1", "query2"])
        
        assert len(result["results"]) == 0
        assert len(result["errors"]) == 2
        assert result["summary"]["total"] == 2
        assert result["summary"]["successful"] == 0
        assert result["summary"]["failed"] == 2

    @pytest.mark.asyncio
    async def test_batch_search_summary_counts(self, service):
        """Test batch_search returns correct summary counts."""
        async def mock_search(query, *args, **kwargs):
            if query == "fail":
                raise ValueError("error")
            return {"query": query, "results": []}
        
        with patch.object(service, 'search', side_effect=mock_search):
            result = await service.batch_search(["success1", "fail", "success2"])
        
        assert result["summary"]["total"] == 3
        assert result["summary"]["successful"] == 2
        assert result["summary"]["failed"] == 1
