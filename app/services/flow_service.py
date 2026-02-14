import json
import logging
import re
from typing import Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class FlowGenerationService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        masked_key = f"{self.api_key[:10]}...{self.api_key[-5:]}" if self.api_key else "None"
        print(f"FlowGenerationService initialized with key: {masked_key}")
        self.openai_url = "https://api.openai.com/v1/chat/completions"

    async def generate_flow(self, prompt: str) -> Dict[str, Any]:
        logger.info(f"Generating flow for prompt: {prompt}")
        
        system_prompt = """
You are an expert at designing data flows for a web intelligence platform.
Tool nodes:
- 'search': Performs search. Input: 'query'. Output: 'answer', 'results'.
- 'crawl': Crawls URL. Input: 'url', 'query' (optional). Output: 'results'.
- 'extract': Extracts URL. Input: 'url', 'query' (optional). Output: 'answer', 'results'.
- 'map': Maps site. Input: 'url'. Output: 'results'.
- 'qa': QA on context. Input: 'question', 'context'. Output: 'answer'.

JSON Structure:
{
    "nodes": [{"id": "node_1", "type": "search", "position": {"x": 100, "y": 100}, "data": {"query": "..."}}],
    "edges": [{"id": "edge_1_2", "source": "node_1", "target": "node_2"}]
}
Return ONLY the JSON. No explanation.
"""

        # Try OpenAI First
        try:
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Generate a flow for: {prompt}"}
                ],
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                response = await client.post(self.openai_url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.warning(f"OpenAI failed ({response.status_code}), falling back to Tavily")
        except Exception as e:
            logger.warning(f"OpenAI error: {str(e)}, falling back to Tavily")

        # Fallback to Tavily AI Answer
        try:
            # Slim down the prompt for Tavily to avoid 400 errors
            slim_prompt = f"Convert this request into a JSON flow (search, crawl, extract, map, qa nodes): {prompt}. Return only JSON."
            payload = {
                "api_key": settings.TAVILY_API_KEY,
                "query": slim_prompt,
                "include_answer": True,
                "search_depth": "basic"
            }
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(f"{settings.TAVILY_BASE_URL}/search", json=payload)
                if response.status_code == 200:
                    data = response.json()
                    answer = data.get("answer", "")
                    json_match = re.search(r'\{.*\}', answer, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
        except Exception as e:
            logger.warning(f"Tavily fallback error: {str(e)}")
            
        # Final Heuristic Fallback for common requests
        return self._heuristic_fallback(prompt)

    def _heuristic_fallback(self, prompt: str) -> Dict[str, Any]:
        """Recognizes common workflow patterns when AI is unavailable."""
        p = prompt.lower()
        nodes = []
        edges = []
        
        # Pattern 1: Search -> (Crawl/Extract) -> QA
        if "search" in p or "find" in p:
            nodes.append({"id": "search_1", "type": "search", "position": {"x": 100, "y": 100}, "data": {"query": prompt}})
            
            if "crawl" in p:
                nodes.append({"id": "crawl_1", "type": "crawl", "position": {"x": 400, "y": 100}, "data": {"label": "crawl"}})
                edges.append({"id": "e_s_c", "source": "search_1", "target": "crawl_1"})
                last_node = "crawl_1"
            elif "extract" in p:
                nodes.append({"id": "extract_1", "type": "extract", "position": {"x": 400, "y": 100}, "data": {"label": "extract"}})
                edges.append({"id": "e_s_e", "source": "search_1", "target": "extract_1"})
                last_node = "extract_1"
            else:
                last_node = "search_1"

            if "qa" in p or "ask" in p or "find the best" in p:
                nodes.append({"id": "qa_1", "type": "qa", "position": {"x": 700, "y": 100}, "data": {"question": "Based on the results, which one is best?"}})
                edges.append({"id": "e_last_qa", "source": last_node, "target": "qa_1"})

        # Pattern 2: Multi-step Extract/Crawl (if no search)
        elif "crawl" in p or "extract" in p:
            if "crawl" in p:
                nodes.append({"id": "crawl_1", "type": "crawl", "position": {"x": 100, "y": 100}, "data": {"label": "crawl"}})
                last_node = "crawl_1"
            if "extract" in p:
                nodes.append({"id": "extract_1", "type": "extract", "position": {"x": 400, "y": 100}, "data": {"label": "extract"}})
                if nodes[0]["id"] != "extract_1":
                    edges.append({"id": "e_c_e", "source": "crawl_1", "target": "extract_1"})
                last_node = "extract_1"

        if not nodes:
             nodes.append({"id": "search_1", "type": "search", "position": {"x": 100, "y": 100}, "data": {"query": prompt}})

        return {"nodes": nodes, "edges": edges}

flow_generation_service = FlowGenerationService()
