"""
Test script to verify FastAPI application structure
"""
import sys
import os

# Add the parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing module imports...")
    
    try:
        from app.core.config import settings
        print("??? Config module imported successfully")
        print(f"  - API Name: {settings.APP_NAME}")
        print(f"  - Port: {settings.PORT}")
        print(f"  - MongoDB URI: {settings.MONGODB_URI[:30]}...")
    except Exception as e:
        print(f"??? Failed to import config: {e}")
        return False
    
    try:
        from app.api.models.search import SearchRequest, SearchResponse
        print("??? Search models imported successfully")
    except Exception as e:
        print(f"??? Failed to import search models: {e}")
        return False
    
    try:
        from app.services.tavily_service import tavily_service
        print("??? Tavily service imported successfully")
    except Exception as e:
        print(f"??? Failed to import Tavily service: {e}")
        return False
    
    try:
        from app.services.mongodb_service import mongodb_service
        print("??? MongoDB service imported successfully")
    except Exception as e:
        print(f"??? Failed to import MongoDB service: {e}")
        return False
    
    try:
        from app.api.routes.search import router
        print("??? Search router imported successfully")
    except Exception as e:
        print(f"??? Failed to import search router: {e}")
        return False
    
    try:
        from main import app
        print("??? FastAPI app imported successfully")
        print(f"  - Title: {app.title}")
        print(f"  - Version: {app.version}")
    except Exception as e:
        print(f"??? Failed to import FastAPI app: {e}")
        return False
    
    return True


def test_validation():
    """Test Pydantic model validation"""
    print("\nTesting Pydantic validation...")
    
    try:
        from app.api.models.search import SearchRequest
        
        # Valid request
        valid_request = SearchRequest(
            queries=["test query"],
            search_depth="advanced",
            max_results=5
        )
        print("??? Valid search request accepted")
        
        # Test validation - empty queries should fail
        try:
            invalid_request = SearchRequest(
                queries=[],
                search_depth="advanced"
            )
            print("??? Empty queries validation failed - should have raised error")
            return False
        except ValueError:
            print("??? Empty queries correctly rejected")
        
        # Test validation - invalid search depth should fail
        try:
            invalid_request = SearchRequest(
                queries=["test"],
                search_depth="invalid_depth"
            )
            print("??? Invalid search depth validation failed")
            return False
        except ValueError:
            print("??? Invalid search depth correctly rejected")
        
        from app.api.models.crawl import CrawlRequest
        
        # Valid crawl request
        valid_crawl = CrawlRequest(
            url="https://docs.tavily.com",
            instructions="Find all pages on the Python SDK",
            max_depth=2
        )
        print("??? Valid crawl request accepted")

        return True
        
    except Exception as e:
        print(f"??? Validation test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("FastAPI Application Structure Test")
    print("=" * 60)
    print()
    
    all_passed = True
    
    # Test imports
    if not test_imports():
        all_passed = False
    
    # Test validation
    if not test_validation():
        all_passed = False
    
    print()
    print("=" * 60)
    if all_passed:
        print("??? All tests passed!")
        print()
        print("Next steps:")
        print("1. Ensure MongoDB is running: mongod")
        print("2. Start the server: uvicorn main:app --reload")
        print("3. Visit: http://localhost:8000/docs")
    else:
        print("??? Some tests failed")
    print("=" * 60)
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
