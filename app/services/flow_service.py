import json
import logging
from typing import Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class FlowGenerationService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.openai_url = "https://api.openai.com/v1/chat/completions"

    async def generate_flow(self, prompt: str) -> Dict[str, Any]:
        logger.info(f"Generating flow for prompt: {prompt}")
        
        system_prompt = """
You are an expert at designing data flows for a web intelligence platform.
The platform has the following tool nodes:
- 'search': Performs a web search. Input: 'query'. Output: 'answer', 'results'.
- 'crawl': Crawls a URL. Input: 'url', 'query' (optional instructions). Output: 'results'.
- 'extract': Extracts content from a URL. Input: 'url', 'query' (optional extraction goal). Output: 'answer', 'results'.
- 'map': Maps the structure of a website. Input: 'url'. Output: 'results'.
- 'qa': Answers questions based on context. Input: 'question', 'context'. Output: 'answer'.

When a node follows another, it can use the output of the previous node as input.
For example, an 'extract' node following a 'search' node will automatically receive the URL from the search result.

Your task is to translate a user's natural language request into a JSON structure representing a flow of these nodes.
The JSON must follow this exact structure:
{
    "nodes": [
        {
            "id": "node_1",
            "type": "search",
            "position": {"x": 100, "y": 100},
            "data": {"query": "AI news"}
        }
    ],
    "edges": [
        {
            "id": "edge_1_2",
            "source": "node_1",
            "target": "node_2"
        }
    ]
}

RULES:
1. Only use the node types listed above.
2. Ensure nodes are logically connected.
3. Provide initial data (like 'query' or 'url') if mentioned in the prompt.
4. If a node depends on a previous one's output, just place it in the sequence; the system handles the data passing.
5. Return ONLY the JSON object. No explanation.
"""

        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a flow for: {prompt}"}
            ],
            "response_format": {"type": "json_object"}
        }

        try:
            print(f"Calling OpenAI with prompt: {prompt}") # Debug print
            async with httpx.AsyncClient(timeout=30.0) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                }
                response = await client.post(
                    self.openai_url,
                    json=payload,
                    headers=headers
                )
                
                print(f"OpenAI Response Status: {response.status_code}") # Debug print
                if response.status_code != 200:
                    error_detail = response.text
                    print(f"OpenAI Error Detail: {error_detail}") # Debug print
                    logger.error(f"OpenAI API error ({response.status_code}): {error_detail}")
                    raise ValueError(f"OpenAI API error: {error_detail}")
                
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                logger.info(f"Generated flow JSON: {content}")
                return json.loads(content)
                
        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {str(e)}") # Debug print
            logger.error(f"HTTP error generating flow: {str(e)}, Response: {e.response.text}")
            raise ValueError(f"Failed to generate flow: {str(e)}")
        except Exception as e:
            print(f"General Error: {str(e)}") # Debug print
            logger.error(f"Error generating flow with OpenAI: {str(e)}")
            raise ValueError(f"Failed to generate flow: {str(e)}")

flow_generation_service = FlowGenerationService()
