
import asyncio
import httpx
import json


API_BASE_URL = "http://localhost:8000"


async def test_health_check():
    """Test the health check endpoint"""
    print("=" * 60)
    print("Testing Health Check Endpoint")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{API_BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()


async def test_single_search():
    """Test search with a single query"""
    print("=" * 60)
    print("Testing Single Search Query")
    print("=" * 60)
    
    request_data = {
        "queries": ["Latest AI developments in 2026"],
        "search_depth": "advanced",
        "max_results": 3,
        "include_answer": True
    }
    
    print(f"Request: {json.dumps(request_data, indent=2)}\n")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/web_search/search",
                json=request_data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✓ Search successful!")
                print(f"Total queries: {data['summary']['total']}")
                print(f"Successful: {data['summary']['successful']}")
                print(f"Failed: {data['summary']['failed']}")
                
                if data['results']:
                    result = data['results'][0]
                    print(f"\nQuery: {result['query']}")
                    print(f"Answer: {result['answer'][:150]}...")
                    print(f"Number of results: {len(result['results'])}")
                    
                    if result['results']:
                        print(f"\nFirst result:")
                        print(f"  Title: {result['results'][0]['title']}")
                        print(f"  URL: {result['results'][0]['url']}")
                        print(f"  Score: {result['results'][0]['score']}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print()


async def test_batch_search():
    """Test search with multiple queries"""
    print("=" * 60)
    print("Testing Batch Search (Multiple Queries)")
    print("=" * 60)
    
    request_data = {
        "queries": [
            "Python FastAPI tutorial",
            "MongoDB best practices",
            "Async programming patterns"
        ],
        "search_depth": "basic",
        "max_results": 2,
        "include_answer": True
    }
    
    print(f"Request: {json.dumps(request_data, indent=2)}\n")
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/web_search/search",
                json=request_data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✓ Batch search successful!")
                print(f"Summary: {data['summary']}")
                
                for i, result in enumerate(data['results'], 1):
                    print(f"\n{i}. Query: {result['query']}")
                    print(f"   Results found: {len(result['results'])}")
                    print(f"   Answer: {result['answer'][:100]}...")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print()


async def test_get_results():
    """Test getting recent results from database"""
    print("=" * 60)
    print("Testing Get Recent Results")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/web_search/results?limit=5")
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✓ Retrieved {data['count']} results from database")
                
                if data['results']:
                    print(f"\nMost recent result:")
                    result = data['results'][0]
                    print(f"  Query: {result.get('query', 'N/A')}")
                    print(f"  Timestamp: {result.get('timestamp', 'N/A')}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print()


async def test_get_stats():
    """Test getting statistics"""
    print("=" * 60)
    print("Testing Get Statistics")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{API_BASE_URL}/web_search/stats")
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                stats = response.json()
                print(f"\n✓ Statistics:")
                print(f"  Total results: {stats.get('total_results', 0)}")
                print(f"  Recent results (24h): {stats.get('results_last_24h', 0)}")
                print(f"  Database: {stats.get('database', 'N/A')}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print()


async def test_invalid_request():
    """Test validation with invalid request"""
    print("=" * 60)
    print("Testing Request Validation (Should Fail)")
    print("=" * 60)
    
    request_data = {
        "queries": [],  # Empty queries - should fail
        "search_depth": "invalid",  # Invalid depth - should fail
        "max_results": 100  # Out of range - should fail
    }
    
    print(f"Request: {json.dumps(request_data, indent=2)}\n")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/web_search/search",
                json=request_data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 422:  # Validation error
                print(f"✓ Validation correctly rejected invalid request")
                print(f"Error details: {json.dumps(response.json(), indent=2)}")
            else:
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"Error: {e}")
    
    print()


async def test_extraction():
    print("=" * 60)
    print("Testing URL Extraction")
    print("=" * 60)
    
    request_data = {
        "urls": ["https://en.wikipedia.org/wiki/Artificial_intelligence"],
        "extract_depth": "advanced",
        "include_answer": True
    }
    
    print(f"Request: {json.dumps(request_data, indent=2)}\n")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/extract/",
                json=request_data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✓ Extraction successful!")
                print(f"Summary: {data['summary']}")
                
                if data['results']:
                    result = data['results'][0]
                    print(f"\nExtracted URL: {result['url']}")
                    print(f"Title: {result.get('title')}")
                    print(f"Content: {result['content'][:200]}...")
                
                if data.get('answer'):
                    print(f"\nAI Answer: {data['answer'][:150]}...")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print()


async def test_crawl():
    print("=" * 60)
    print("Testing URL Crawling")
    print("=" * 60)
    
    request_data = {
        "url": "https://docs.tavily.com/welcome",
        "instructions": "find all pages in python sdk",
        "max_depth": 2,
        "max_breadth": 20,
        "limit": 10
    }
    
    print(f"Request: {json.dumps(request_data, indent=2)}\n")
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                f"{API_BASE_URL}/crawl/",
                json=request_data
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"\n✓ Crawl successful!")
                print(f"Total results: {len(data.get('results', []))}")
                
                if data.get('results'):
                    print(f"\nExample result:")
                    result = data['results'][0]
                    print(f"  URL: {result.get('url')}")
                    print(f"  Title: {result.get('title')}")
            else:
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print()


async def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("Web Intelligence API - Example Usage")
    print("=" * 60)
    print(f"Base URL: {API_BASE_URL}")
    print("Ensure the server is running: uvicorn main:app --reload")
    print("=" * 60 + "\n")
    
    await asyncio.sleep(1)
    
    # Run tests
    await test_health_check()
    await test_invalid_request()
    
    # Uncomment to test actual searches (requires Tavily API key and MongoDB)
    # await test_single_search()
    # await test_batch_search()
    # await test_extraction()
    await test_crawl()
    # await test_get_results()
    # await test_get_stats()
    
    print("=" * 60)
    print("Tests completed!")
    print("=" * 60)
    print("\nTo test actual searches:")
    print("1. Ensure MongoDB is running")
    print("2. Check TAVILY_API_KEY in .env")
    print("3. Uncomment the search test functions above")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
