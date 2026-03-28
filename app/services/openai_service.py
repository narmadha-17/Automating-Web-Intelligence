"""
OpenAI API Service Integration
================================

This module provides integration with OpenAI's API for the web intelligence platform.
OpenAI is used as a genuine thinking tool to enhance web intelligence gathering
through advanced AI reasoning and analysis.

Features:
- Advanced reasoning for search query refinement
- Intelligent content analysis and extraction
- Web intelligence synthesis using OpenAI
- Context-aware knowledge integration
"""

import httpx
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import json

from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenAIService:
    """
    Service for integrating OpenAI API for advanced web intelligence.

    OpenAI is leveraged as a core thinking engine to:
    - Refine and understand complex search queries
    - Analyze and synthesize web content
    - Generate intelligent insights from gathered data
    """

    def __init__(self):
        """Initialize OpenAI service with API credentials and configuration."""
        self.api_key = settings.OPENAI_API_KEY
        self.api_url = settings.OPENAI_API_URL
        self.model = settings.OPENAI_MODEL
        self.timeout = settings.OPENAI_TIMEOUT

        if not self.api_key:
            logger.warning(
                "OPENAI_API_KEY not set in environment variables. "
                "Please set it to use OpenAI integration. "
                "Get your API key from: https://platform.openai.com"
            )

    async def ask_question(
        self,
        question: str,
        context: str,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use OpenAI to answer a question based on provided context.

        This powers the QA node in the Dashboard flow.

        Args:
            question: The question to answer
            context: Context from upstream nodes (search results, extracted content, etc.)
            api_key: Optional override API key

        Returns:
            Dictionary containing the answer and metadata
        """
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError(
                "OpenAI API key is not configured. "
                "Please set OPENAI_API_KEY in your .env file"
            )

        logger.info(f"Answering question with OpenAI: '{question[:100]}'")

        # Truncate context to avoid token limits
        max_context = 4000
        if len(context) > max_context:
            context = context[:max_context] + "\n\n[Content truncated for length...]"

        system_prompt = """You are an expert web intelligence analyst powered by OpenAI.
Your role is to provide clear, accurate, well-structured answers based on the provided context.
Always base your answers on the given context. If the context doesn't contain enough information, say so.
Format your response clearly with bullet points or numbered lists when appropriate."""

        user_prompt = f"""Based on the following context, answer this question:

Question: {question}

Context:
{context}

Provide a comprehensive, well-structured answer."""

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.5,
                        "max_tokens": 1500
                    },
                    headers={
                        "Authorization": f"Bearer {active_key}",
                        "Content-Type": "application/json"
                    }
                )

                response.raise_for_status()
                data = response.json()

                answer = data.get("choices", [{}])[0].get("message", {}).get("content", "No answer generated")

                logger.info("Successfully answered question with OpenAI")
                return {
                    "status": "success",
                    "answer": answer,
                    "question": question,
                    "model": self.model,
                    "powered_by": "OpenAI API",
                    "timestamp": datetime.utcnow().isoformat()
                }

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code

            if status_code == 401:
                error_msg = "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file"
            elif status_code == 429:
                error_msg = "Rate limit exceeded on OpenAI API. Please wait before making more requests"
            else:
                error_msg = f"OpenAI API error ({status_code}): {e.response.text}"

            logger.error(f"HTTP error answering question: {error_msg}")
            raise ValueError(error_msg)

        except Exception as e:
            error_msg = f"Error asking OpenAI: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)

    async def analyze_search_query(
        self,
        query: str,
        context: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use OpenAI to analyze and enhance a search query.

        Args:
            query: The original search query to analyze
            context: Optional additional context about the search
            api_key: Optional override API key

        Returns:
            Dictionary containing:
            - refined_query: Enhanced version of the query
            - reasoning: OpenAI's thinking process
            - related_topics: Suggested related search areas
            - intent_analysis: Analysis of search intent
        """
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError(
                "OpenAI API key is not configured. "
                "Please set OPENAI_API_KEY in your .env file"
            )

        logger.info(f"Analyzing search query with OpenAI: '{query}'")

        system_prompt = """You are an advanced web intelligence analyst. Your role is to:
1. Deeply analyze search queries for intent and nuance
2. Identify the core information need
3. Consider multiple perspectives on the query
4. Suggest refinements that will yield better results
5. Provide structured reasoning about your analysis"""

        user_prompt = f"""Analyze this search query and provide structured insights:

Query: {query}
{f'Context: {context}' if context else ''}

Provide your response in this JSON format:
{{
    "refined_query": "An improved version of the query that captures all intent",
    "reasoning": "Your step-by-step thinking about this query",
    "related_topics": ["topic1", "topic2", "topic3"],
    "intent_analysis": "Analysis of what the user is really trying to find",
    "search_strategy": "Recommended approach for finding relevant information"
}}"""

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    },
                    headers={
                        "Authorization": f"Bearer {active_key}",
                        "Content-Type": "application/json"
                    }
                )

                response.raise_for_status()
                data = response.json()

                # Extract the response content
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")

                # Try to parse as JSON, fallback to text response
                try:
                    result = json.loads(content)
                except json.JSONDecodeError:
                    result = {
                        "refined_query": query,
                        "reasoning": content,
                        "related_topics": [],
                        "intent_analysis": "Query analyzed",
                        "search_strategy": "Standard web search"
                    }

                logger.info("Successfully analyzed query with OpenAI")
                return {
                    "status": "success",
                    "original_query": query,
                    **result,
                    "timestamp": datetime.utcnow().isoformat()
                }

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code

            if status_code == 401:
                error_msg = "Invalid OpenAI API key. Please check your OPENAI_API_KEY in .env file"
            elif status_code == 429:
                error_msg = "Rate limit exceeded on OpenAI API. Please wait before making more requests"
            else:
                error_msg = f"OpenAI API error ({status_code}): {e.response.text}"

            logger.error(f"HTTP error analyzing query '{query}': {error_msg}")
            raise ValueError(error_msg)

        except httpx.RequestError as e:
            error_msg = f"OpenAI request failed: {str(e)}"
            logger.error(f"Request error: {error_msg}")
            raise ValueError(error_msg)

    async def synthesize_web_content(
        self,
        search_results: List[Dict[str, Any]],
        query: str,
        api_key: Optional[str] = None,
        custom_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use OpenAI to synthesize and analyze web search results.

        Args:
            search_results: List of search results with title, content, url
            query: Original search query for context
            api_key: Optional override API key
            custom_instruction: Custom instruction for synthesis

        Returns:
            Dictionary containing:
            - synthesis: Main synthesis of the information
            - key_insights: Important findings
            - data_quality: Assessment of source reliability
            - gaps: Identified information gaps
            - next_steps: Recommended follow-up searches
        """
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError(
                "OpenAI API key is not configured. "
                "Please set OPENAI_API_KEY in your .env file"
            )

        logger.info(f"Synthesizing {len(search_results)} web results with OpenAI")

        # Format search results for analysis
        formatted_results = "\n\n".join([
            f"Source {i+1}: {result.get('title', 'Unknown')} ({result.get('url', 'No URL')})\n"
            f"Content: {result.get('content', result.get('text', 'No content'))[:500]}..."
            for i, result in enumerate(search_results[:10])  # Limit to top 10 to fit token limits
        ])

        system_prompt = """You are an expert web intelligence analyst. Your task is to:
1. Synthesize information from multiple web sources
2. Identify key insights and patterns
3. Assess source reliability and potential biases
4. Flag gaps in available information
5. Suggest follow-up research directions

Use critical thinking and provide structured, actionable insights."""

        user_prompt = f"""Analyze and synthesize these web search results for the query: "{query}"

{formatted_results}

{f'Additional guidance: {custom_instruction}' if custom_instruction else ''}

Provide your analysis in this JSON format:
{{
    "synthesis": "Comprehensive summary of information across all sources",
    "key_insights": ["insight1", "insight2", "insight3"],
    "data_quality": {{"reliable_sources": 0, "mixed_sources": 0, "unreliable_sources": 0, "assessment": ""}},
    "potential_biases": ["bias1", "bias2"],
    "information_gaps": ["gap1", "gap2"],
    "next_steps": ["follow-up search 1", "follow-up search 2"]
}}"""

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.6,
                        "max_tokens": 1500
                    },
                    headers={
                        "Authorization": f"Bearer {active_key}",
                        "Content-Type": "application/json"
                    }
                )

                response.raise_for_status()
                data = response.json()

                content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")

                try:
                    result = json.loads(content)
                except json.JSONDecodeError:
                    result = {
                        "synthesis": content,
                        "key_insights": [],
                        "data_quality": {"assessment": "Analysis provided above"},
                        "potential_biases": [],
                        "information_gaps": [],
                        "next_steps": []
                    }

                logger.info("Successfully synthesized results with OpenAI")
                return {
                    "status": "success",
                    "query": query,
                    "sources_analyzed": len(search_results),
                    **result,
                    "timestamp": datetime.utcnow().isoformat()
                }

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code

            if status_code == 401:
                error_msg = "Invalid OpenAI API key"
            elif status_code == 429:
                error_msg = "Rate limit exceeded on OpenAI API"
            else:
                error_msg = f"OpenAI API error ({status_code})"

            logger.error(f"HTTP error synthesizing results: {error_msg}")
            raise ValueError(error_msg)

        except Exception as e:
            error_msg = f"Error synthesizing with OpenAI: {str(e)}"
            logger.error(error_msg)
            raise ValueError(error_msg)

    async def extract_and_analyze(
        self,
        url: str,
        query: Optional[str] = None,
        api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Use OpenAI to intelligently extract and analyze content from a URL.

        Args:
            url: URL to analyze
            query: Optional query context
            api_key: Optional override API key

        Returns:
            Dictionary containing:
            - extracted_info: Key information extracted
            - relevance: How relevant to the query
            - summary: OpenAI's analysis summary
            - entities: Identified key entities
        """
        active_key = api_key or self.api_key
        if not active_key:
            raise ValueError("OpenAI API key not configured")

        logger.info(f"Analyzing content from {url} with OpenAI")

        system_prompt = """You are an intelligent content analyzer. Extract and analyze:
1. Main topics and themes
2. Key entities and relationships
3. Relevance to the query
4. Important takeaways
5. Quality and credibility assessment"""

        user_prompt = f"""Analyze the content from this URL: {url}
{f'Query context: {query}' if query else ''}

Provide structured analysis in JSON format with extracted information and insights."""

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.api_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.5,
                        "max_tokens": 800
                    },
                    headers={
                        "Authorization": f"Bearer {active_key}",
                        "Content-Type": "application/json"
                    }
                )

                response.raise_for_status()
                data = response.json()

                content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")

                try:
                    result = json.loads(content)
                except json.JSONDecodeError:
                    result = {"summary": content}

                logger.info(f"Successfully analyzed content from {url}")
                return {
                    "status": "success",
                    "url": url,
                    **result,
                    "timestamp": datetime.utcnow().isoformat()
                }

        except Exception as e:
            logger.error(f"Error analyzing {url}: {str(e)}")
            raise ValueError(f"Failed to analyze URL: {str(e)}")


# Singleton instance
_openai_service = None


def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service singleton."""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
