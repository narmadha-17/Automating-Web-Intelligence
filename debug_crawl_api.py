import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

async def test_crawl():
    api_key = os.getenv("TAVILY_API_KEY")
    url = "https://api.tavily.com/crawl"
    payload = {
        "api_key": api_key,
        "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
        "max_depth": 1,
        "max_breadth": 2,
        "limit": 2
    }
    
    print(f"Calling Tavily Crawl directly...")
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {api_key}"}
            response = await client.post(url, json=payload, headers=headers, timeout=60.0)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print("First result keys:", data.get("results", [{}])[0].keys())
                print("First result snippet:", json.dumps(data.get("results", [{}])[0], indent=2)[:500])
            else:
                print(f"Error: {response.text}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_crawl())
