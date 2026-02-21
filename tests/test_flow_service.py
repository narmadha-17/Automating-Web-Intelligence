"""Tests for app.services.flow_service module."""

import pytest
from app.services.flow_service import FlowGenerationService


class TestFlowGenerationServiceHeuristics:
    """Tests for FlowGenerationService heuristic fallback logic."""

    @pytest.fixture
    def service(self):
        """Create a FlowGenerationService instance for testing."""
        return FlowGenerationService()

    def test_extract_url_finds_https_url(self, service):
        """Test URL extraction with https URL."""
        text = "Check out https://example.com for more info"
        result = service._extract_url(text)
        assert result == "https://example.com"

    def test_extract_url_finds_http_url(self, service):
        """Test URL extraction with http URL."""
        text = "Visit http://test.org/page"
        result = service._extract_url(text)
        assert result == "http://test.org/page"

    def test_extract_url_returns_none_when_no_url(self, service):
        """Test URL extraction returns None when no URL present."""
        text = "No URL in this text"
        result = service._extract_url(text)
        assert result is None

    def test_extract_url_strips_trailing_punctuation(self, service):
        """Test URL extraction strips trailing punctuation."""
        text = "Check https://example.com."
        result = service._extract_url(text)
        assert result == "https://example.com"

    def test_heuristic_search_query(self, service):
        """Test heuristic fallback for search query."""
        result = service._heuristic_fallback("search for AI news")
        
        assert "nodes" in result
        assert "edges" in result
        assert len(result["nodes"]) >= 1
        
        # Should have a search node
        node_types = [n["type"] for n in result["nodes"]]
        assert "search" in node_types

    def test_heuristic_crawl_query(self, service):
        """Test heuristic fallback for crawl query."""
        result = service._heuristic_fallback("crawl https://example.com")
        
        assert "nodes" in result
        node_types = [n["type"] for n in result["nodes"]]
        assert "crawl" in node_types

    def test_heuristic_extract_query(self, service):
        """Test heuristic fallback for extract query."""
        result = service._heuristic_fallback("extract from https://example.com")
        
        assert "nodes" in result
        node_types = [n["type"] for n in result["nodes"]]
        assert "extract" in node_types

    def test_heuristic_map_with_url(self, service):
        """Test heuristic fallback for map URL query."""
        result = service._heuristic_fallback("render all urls from https://example.com")
        
        assert "nodes" in result
        node_types = [n["type"] for n in result["nodes"]]
        assert "map" in node_types

    def test_heuristic_summarize_with_url(self, service):
        """Test heuristic fallback for summarize URL query."""
        result = service._heuristic_fallback("summarize https://example.com")
        
        assert "nodes" in result
        # Should create map -> extract -> qa chain
        node_types = [n["type"] for n in result["nodes"]]
        assert "map" in node_types
        assert "qa" in node_types

    def test_heuristic_nodes_have_required_fields(self, service):
        """Test that generated nodes have required fields."""
        result = service._heuristic_fallback("search for test")
        
        for node in result["nodes"]:
            assert "id" in node
            assert "type" in node
            assert "position" in node
            assert "data" in node
            assert "x" in node["position"]
            assert "y" in node["position"]

    def test_heuristic_edges_have_required_fields(self, service):
        """Test that generated edges have required fields."""
        result = service._heuristic_fallback("search and summarize AI news")
        
        for edge in result["edges"]:
            assert "id" in edge
            assert "source" in edge
            assert "target" in edge

    def test_heuristic_default_fallback(self, service):
        """Test that unknown queries get a default search + qa flow."""
        result = service._heuristic_fallback("random query without keywords")
        
        assert "nodes" in result
        assert len(result["nodes"]) >= 1

    def test_heuristic_what_question(self, service):
        """Test heuristic for 'what' questions."""
        result = service._heuristic_fallback("what is machine learning")
        
        node_types = [n["type"] for n in result["nodes"]]
        assert "search" in node_types

    def test_heuristic_compare_query(self, service):
        """Test heuristic for compare queries."""
        result = service._heuristic_fallback("compare Python and JavaScript")
        
        node_types = [n["type"] for n in result["nodes"]]
        assert "search" in node_types
        assert "qa" in node_types

    def test_heuristic_analyze_query(self, service):
        """Test heuristic for analyze queries."""
        result = service._heuristic_fallback("analyze the latest tech trends")
        
        node_types = [n["type"] for n in result["nodes"]]
        assert "search" in node_types
        assert "qa" in node_types

    def test_heuristic_top_n_news(self, service):
        """Test heuristic for top N news query with URL."""
        result = service._heuristic_fallback("summarize top 5 news from https://news.com")
        
        node_types = [n["type"] for n in result["nodes"]]
        assert "map" in node_types
        assert "extract" in node_types
        assert "qa" in node_types

    def test_heuristic_crawl_and_summarize(self, service):
        """Test heuristic for crawl + summarize query (without URL triggers map flow)."""
        # When URL + summarize keywords are present, map flow takes precedence
        result = service._heuristic_fallback("crawl https://example.com and summarize")
        
        node_types = [n["type"] for n in result["nodes"]]
        # The heuristic prioritizes map flow when URL + summarize detected
        assert "qa" in node_types
        # Either crawl or map should be present
        assert "crawl" in node_types or "map" in node_types

    def test_heuristic_crawl_only(self, service):
        """Test heuristic for pure crawl query without summarize."""
        result = service._heuristic_fallback("crawl https://example.com please")
        
        node_types = [n["type"] for n in result["nodes"]]
        assert "crawl" in node_types

    def test_heuristic_positions_are_incremental(self, service):
        """Test that node positions are incrementally placed."""
        result = service._heuristic_fallback("map https://example.com and summarize")
        
        if len(result["nodes"]) > 1:
            x_positions = [n["position"]["x"] for n in result["nodes"]]
            # Check positions are different/incremental
            assert len(set(x_positions)) == len(x_positions)

    def test_heuristic_edges_reference_valid_nodes(self, service):
        """Test that edges reference existing nodes."""
        result = service._heuristic_fallback("search and analyze AI")
        
        node_ids = {n["id"] for n in result["nodes"]}
        
        for edge in result["edges"]:
            assert edge["source"] in node_ids
            assert edge["target"] in node_ids
