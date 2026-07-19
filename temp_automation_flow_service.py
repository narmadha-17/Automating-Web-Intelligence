import json
import logging
import re
from typing import Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class FlowGenerationService:
    def __init__(self):
        # Use OpenAI API for flow generation
        self.api_key = settings.OPENAI_API_KEY
        self.api_url = settings.OPENAI_API_URL
        self.model = settings.OPENAI_MODEL
        masked_key = f"{self.api_key[:10]}...{self.api_key[-5:]}" if self.api_key else "None"
        logger.info(f"FlowGenerationService initialized with OpenAI key: {masked_key}")

    async def generate_flow(self, prompt: str) -> Dict[str, Any]:
        logger.info(f"Generating flow for prompt: {prompt}")

        try:
            system_prompt = """
You are an expert at designing data flows for a web intelligence platform.
Tool nodes:
- 'search': Performs a web search. Input data field: 'query'. Output: 'answer', 'results' (list of {url, content}).
- 'crawl': Crawls a URL and its sub-pages. Input data fields: 'url', 'query' (optional). Output: 'results'.
- 'extract': Extracts content from a URL. Input data fields: 'url', 'query' (optional). Output: 'answer', 'results'.
- 'map': Maps all URLs on a site (sitemap). Input data field: 'url'. Output: 'results' (list of URL strings).
- 'qa': Answers a question using upstream context. Input data field: 'question'. Output: 'answer'.

IMPORTANT RULES:
- When the prompt contains a URL AND words like 'render urls', 'list urls', 'map site', 'summarize top N':
  Use: map -> extract -> qa chain.
  The map node finds all URLs, extract gets content from them, qa summarizes.
- When the prompt is about searching/finding info on a topic without a specific URL:
  Use: search node, optionally followed by qa.
- When the prompt mentions crawling a specific site:
  Use: crawl -> qa chain.
- Nodes are positioned at x: 100, 400, 700, 1000 and y: 150 for a horizontal flow.

JSON Structure (return ONLY this, no explanation):
{
    "nodes": [{"id": "node_1", "type": "search", "position": {"x": 100, "y": 150}, "data": {"query": "..."}}],
    "edges": [{"id": "edge_1_2", "source": "node_1", "target": "node_2"}]
}
"""

            # Try OpenAI first - only if API key is available
            if self.api_key and self.api_key not in ("None", "your-openai-api-key-here"):
                try:
                    payload = {
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Generate a flow for: {prompt}"}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000,
                        "response_format": {"type": "json_object"}
                    }
                    async with httpx.AsyncClient(timeout=20.0) as client:
                        headers = {
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {self.api_key}"
                        }
                        response = await client.post(
                            f"{self.api_url}/chat/completions",
                            json=payload,
                            headers=headers
                        )

                        if response.status_code == 200:
                            data = response.json()
                            content = data["choices"][0]["message"]["content"]

                            # Try direct JSON parse first (response_format ensures JSON)
                            try:
                                result = json.loads(content)
                                if "nodes" in result and "edges" in result:
                                    logger.info("Flow generated successfully via OpenAI API")
                                    return result
                            except json.JSONDecodeError:
                                pass

                            # Fallback: extract JSON substring
                            json_match = re.search(r'\{[\s\S]*\}', content)
                            if json_match:
                                result = json.loads(json_match.group())
                                if "nodes" in result and "edges" in result:
                                    logger.info("Flow generated successfully via OpenAI API (regex)")
                                    return result

                            logger.warning("OpenAI response didn't contain valid flow JSON, falling back")
                        else:
                            logger.warning(f"OpenAI failed ({response.status_code}), falling back to heuristic")
                except Exception as e:
                    logger.warning(f"OpenAI error: {str(e)}, falling back to heuristic")
            else:
                logger.warning("OpenAI API key not configured, using heuristic fallback")

            # Fallback to Tavily AI Answer - only if API key is available
            if settings.TAVILY_API_KEY and settings.TAVILY_API_KEY != "None":
                try:
                    slim_prompt = (
                        f"Convert this request into a JSON flow (search, crawl, extract, map, qa nodes): "
                        f"{prompt}. Return only JSON."
                    )
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
                                result = json.loads(json_match.group())
                                if "nodes" in result and "edges" in result:
                                    logger.info("Flow generated successfully via Tavily")
                                    return result
                except Exception as e:
                    logger.warning(f"Tavily fallback error: {str(e)}")
            else:
                logger.warning("Tavily API key not configured, using heuristic fallback")

        except Exception as e:
            logger.error(f"Unexpected error in generate_flow: {str(e)}")

        # Final Heuristic Fallback - always succeeds
        logger.info("Using heuristic fallback for flow generation")
        return self._heuristic_fallback(prompt)

    def _extract_url(self, text: str):
        """Extract the first URL found in the text."""
        url_pattern = re.search(r'https?://[^\s]+', text)
        return url_pattern.group().rstrip('.,;') if url_pattern else None

    def _heuristic_fallback(self, prompt: str) -> Dict[str, Any]:
        """Recognizes common workflow patterns when AI is unavailable."""
        p = prompt.lower()
        nodes = []
        edges = []
        last_node = None

        detected_url = self._extract_url(prompt)

        # Pattern 0: URL present + render/list/map URLs + summarize GÂ∆ Map GÂ∆ Extract GÂ∆ QA
        url_related = any(kw in p for kw in ['render', 'list url', 'all url', 'urls', 'sitemap', 'map site', 'site map'])
        summarize_related = any(kw in p for kw in ['summarize', 'summary', 'news', 'top', 'bullet', 'brief', 'overview'])

        if detected_url and (url_related or summarize_related):
            num_match = re.search(r'(\d+)\s*(top|latest|recent|urls?|results?|news)', p)
            num = int(num_match.group(1)) if num_match else 5

            nodes.append({
                "id": "map_1", "type": "map",
                "position": {"x": 100, "y": 150},
                "data": {"url": detected_url, "label": f"Map {detected_url}"}
            })
            nodes.append({
                "id": "extract_1", "type": "extract",
                "position": {"x": 450, "y": 150},
                "data": {"label": f"Extract Top {num} Pages", "limit": num}
            })
            edges.append({"id": "e_m_e", "source": "map_1", "target": "extract_1"})

            if 'news' in p:
                question = (
                    f"Summarize the top {num} AI news articles in {num} bullet points. "
                    "For each, include the title and key takeaway."
                )
            elif summarize_related:
                question = (
                    f"Based on the extracted content, provide a concise summary of the "
                    f"top {num} items in {num} bullet points."
                )
            else:
                question = (
                    f"Based on the content from {detected_url}, list the top {num} items "
                    "with a brief description each."
                )

            nodes.append({
                "id": "qa_1", "type": "qa",
                "position": {"x": 800, "y": 150},
                "data": {"question": question}
            })
            edges.append({"id": "e_e_q", "source": "extract_1", "target": "qa_1"})
            return {"nodes": nodes, "edges": edges}

        # Pattern 1: Search GÂ∆ (Crawl/Extract) GÂ∆ QA
        search_keywords = [
            'search', 'find', 'research', 'compare', 'analyze', 'investigate',
            'what', 'how', 'why', 'explain', 'tell', 'describe', 'latest', 'news'
        ]
        is_search_query = any(kw in p for kw in search_keywords)

        if is_search_query:
            nodes.append({
                "id": "search_1", "type": "search",
                "position": {"x": 100, "y": 150},
                "data": {"query": prompt}
            })
            last_node = "search_1"

            if "crawl" in p:
                nodes.append({
                    "id": "crawl_1", "type": "crawl",
                    "position": {"x": 450, "y": 150},
                    "data": {"label": "Crawl"}
                })
                edges.append({"id": "e_s_c", "source": "search_1", "target": "crawl_1"})
                last_node = "crawl_1"
            elif "extract" in p:
                nodes.append({
                    "id": "extract_1", "type": "extract",
                    "position": {"x": 450, "y": 150},
                    "data": {"label": "Extract"}
                })
                edges.append({"id": "e_s_e", "source": "search_1", "target": "extract_1"})
                last_node = "extract_1"

            qa_keywords = [
                'qa', 'ask', 'summarize', 'compare',
                'analyze', 'explain', 'describe', 'tell'
            ]
            question_keywords = ['what', 'how', 'why']
            needs_qa = any(kw in p for kw in qa_keywords) or any(qk in p for qk in question_keywords)

            if needs_qa:
                nodes.append({
                    "id": "qa_1", "type": "qa",
                    "position": {"x": 800, "y": 150},
                    "data": {"question": "Based on the results, provide a concise summary with key insights."}
                })
                edges.append({"id": "e_last_qa", "source": last_node, "target": "qa_1"})

            return {"nodes": nodes, "edges": edges}

        # Pattern 2: Crawl/Extract without search
        if "crawl" in p or "extract" in p:
            if "crawl" in p:
                url = detected_url or ""
                nodes.append({
                    "id": "crawl_1", "type": "crawl",
                    "position": {"x": 100, "y": 150},
                    "data": {"url": url, "label": "Crawl"}
                })
                last_node = "crawl_1"
            if "extract" in p:
                url = detected_url or ""
                nodes.append({
                    "id": "extract_1", "type": "extract",
                    "position": {"x": 450, "y": 150},
                    "data": {"url": url, "label": "Extract"}
                })
                if last_node:
                    edges.append({"id": "e_c_e", "source": last_node, "target": "extract_1"})
                last_node = "extract_1"

            qa_keywords = ['summarize', 'analyze', 'qa', 'ask', 'explain', 'describe']
            if any(kw in p for kw in qa_keywords):
                nodes.append({
                    "id": "qa_1", "type": "qa",
                    "position": {"x": 800, "y": 150},
                    "data": {"question": "Based on the extracted content, provide a summary and key insights."}
                })
                if last_node:
                    edges.append({"id": "e_last_qa", "source": last_node, "target": "qa_1"})

            return {"nodes": nodes, "edges": edges}

        # Final fallback: default search + QA
        nodes.append({
            "id": "search_1", "type": "search",
            "position": {"x": 100, "y": 150},
            "data": {"query": prompt}
        })
        nodes.append({
            "id": "qa_1", "type": "qa",
            "position": {"x": 450, "y": 150},
            "data": {"question": "Based on the search results, provide a helpful answer to the user's question."}
        })
        edges.append({"id": "e_s_q", "source": "search_1", "target": "qa_1"})

        return {"nodes": nodes, "edges": edges}


flow_generation_service = FlowGenerationService()
