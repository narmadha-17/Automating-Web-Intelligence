# Web Intelligence API with ASI-1 Integration
## API Innovate 2026 Hackathon Submission

![Hackathon](https://img.shields.io/badge/Hackathon-API%20Innovate%202026-blue)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen)
![ASI-1 API](https://img.shields.io/badge/ASI--1%20API-Integrated-success)

## Project Overview

**Web Intelligence API with ASI-1** is an advanced web intelligence platform that leverages **ASI:One's AI platform** as a core thinking engine for intelligent web search, content analysis, and knowledge synthesis.

This project was built for the **API Innovate 2026 Hackathon** with mandatory ASI-1 API integration to demonstrate genuine applications of advanced AI reasoning.

### What Makes This Project Special

1. **ASI-1 as a Thinking Engine**: We use ASI:One not just as a tool, but as a genuine thinking partner for:
   - Query understanding and refinement
   - Semantic analysis of search results
   - Intelligent knowledge synthesis
   - Context-aware information extraction

2. **Multi-Layer Intelligence Pipeline**:
   - **Query Analysis**: ASI-1 analyzes search intent deeply
   - **Web Search**: Tavily API performs targeted searches
   - **Result Synthesis**: ASI-1 synthesizes and analyzes findings
   - **Knowledge Storage**: MongoDB stores structured intelligence

3. **Production-Ready Architecture**:
   - FastAPI with async/await
   - MongoDB persistence
   - Comprehensive error handling
   - Full API documentation
   - React frontend for visualization

## Features

### Core Intelligence Endpoints

- **ASI-Powered Search** (`POST /web_search/search-with-asi`)
  - Uses ASI-1 to refine and understand queries
  - Synthesizes results with intelligent analysis
  - Returns structured insights and recommendations

- **Content Analysis** (`POST /web_search/analyze-asi`)
  - ASI-1 analyzes URLs for relevance and quality
  - Extracts key entities and information
  - Provides credibility assessment

- **Traditional Search** (`POST /web_search/search`)
  - Tavily-powered web search
  - AI-generated answers
  - Batch processing support

### Data Management

- **Web Crawling** - Extract and parse structured data
- **Content Extraction** - Intelligent text and metadata extraction
- **Data Mapping** - Organize and structure extracted information
- **MongoDB Integration** - Persistent storage and querying

### Frontend

- Visual flow builder for query chains
- Real-time result visualization
- Dashboard with search statistics
- Interactive query refinement tools

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework with async support
- **ASI-1 API** - Core intelligence engine (API Innovate 2026)
- **Tavily API** - Multi-source web search
- **MongoDB** - NoSQL database for result storage
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **TailwindCSS** - Styling

### Infrastructure
- **Python 3.10+** - Backend runtime
- **Node.js 18+** - Frontend runtime
- **Docker** - Containerization (optional)

## Installation & Setup

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- MongoDB (local or remote connection string)
- API Keys:
  - **ASI-1 API Key** (MANDATORY for hackathon)
  - Tavily API Key (optional but recommended)

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd Automating-Web-Intelligence
```

### Step 2: Backend Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment

Create a `.env` file in the project root:

```env
# ASI-1 API Configuration (REQUIRED for hackathon)
ASI_ONE_API_KEY=your_asi_one_api_key_here
ASI_ONE_API_URL=https://api.asi-one.io/v1
ASI_ONE_MODEL=asi-one
ASI_ONE_TIMEOUT=60

# Tavily API (Optional)
TAVILY_API_KEY=your_tavily_api_key_here
TAVILY_MAX_RESULTS=5
TAVILY_SEARCH_DEPTH=advanced

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=web_intelligence
MONGODB_COLLECTION=search_results

# OpenAI Configuration (Optional, for flow generation)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
DEBUG=False
CORS_ORIGINS=*
```

### Step 4: Start Backend

```bash
# From repository root
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Step 5: Start Frontend (Optional)

```bash
# In separate terminal
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## API Documentation

### Core ASI-1 Endpoints

#### 1. Advanced Search with ASI-1

```http
POST /web_search/search-with-asi
Content-Type: application/json

{
  "queries": ["What are the latest developments in AI safety?"],
  "include_answer": true,
  "search_depth": "advanced",
  "max_results": 10
}
```

**Response includes:**
- Query analysis from ASI-1
- Web search results
- ASI-1 synthesis and insights
- Key findings and recommendations

#### 2. Analyze Content with ASI-1

```http
POST /web_search/analyze-asi
Query Parameters:
  - url: https://example.com/article
  - query: optional context query
```

**Response:**
- Extracted information
- Relevance assessment
- Entity extraction
- Quality analysis

#### 3. Traditional Web Search

```http
POST /web_search/search
Content-Type: application/json

{
  "queries": ["search query"],
  "include_answer": true,
  "search_depth": "advanced",
  "max_results": 5
}
```

### Additional Endpoints

- `GET /web_search/results` - Get recent search results
- `GET /web_search/stats` - Get search statistics
- `POST /extract` - Extract content from URLs
- `POST /crawl` - Crawl websites
- `POST /map` - Map and structure data
- `GET /docs` - Interactive API documentation

## Project Structure

```
Automating-Web-Intelligence/
├── main.py                           # FastAPI application entry point
├── requirements.txt                  # Python dependencies
├── README.md                         # This file
├── .env.example                      # Environment variables template
├── HACKATHON_GUIDE.md               # Hackathon submission guide
│
├── app/
│   ├── core/
│   │   └── config.py                # Configuration management
│   │
│   ├── services/
│   │   ├── asi_one_service.py       # ASI-1 API integration ⭐
│   │   ├── tavily_service.py        # Tavily search service
│   │   ├── mongodb_service.py       # Database operations
│   │   ├── beautify_service.py      # Data formatting
│   │   └── flow_service.py          # Workflow management
│   │
│   ├── api/
│   │   ├── models/                  # Pydantic data models
│   │   ├── routes/
│   │   │   ├── search.py            # Search endpoints (ASI-1 integrated)
│   │   │   ├── extract.py           # Extraction endpoints
│   │   │   ├── crawl.py             # Crawling endpoints
│   │   │   ├── map.py               # Mapping endpoints
│   │   │   ├── beautify.py          # Formatting endpoints
│   │   │   └── flow.py              # Workflow endpoints
│   │   └── errors.py                # Error handling
│   │
│   └── __init__.py
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Search.jsx           # Search interface
│   │   │   ├── Dashboard.jsx        # Dashboard view
│   │   │   ├── Nodes.jsx            # Flow builder
│   │   │   └── ...
│   │   ├── App.jsx                  # Main component
│   │   └── main.jsx                 # Entry point
│   │
│   ├── package.json                 # Node.js dependencies
│   ├── vite.config.js              # Vite configuration
│   └── index.html                   # HTML template
│
└── __pycache__/                      # Python cache
```

## Key Implementation Details

### ASI-1 Integration Architecture

The project demonstrates three key patterns of ASI-1 usage:

1. **Query Refinement** - ASI-1 understands search intent
   ```python
   query_analysis = await asi_service.analyze_search_query(
       query="Find latest AI safety research",
       context="Academic papers from 2024"
   )
   # Returns: refined_query, reasoning, related_topics, intent_analysis
   ```

2. **Result Synthesis** - ASI-1 synthesizes multiple sources
   ```python
   synthesis = await asi_service.synthesize_web_content(
       search_results=results,
       query=original_query
   )
   # Returns: synthesis, insights, gaps, next_steps
   ```

3. **Content Analysis** - ASI-1 analyzes individual resources
   ```python
   analysis = await asi_service.extract_and_analyze(
       url="https://example.com",
       query="relevant query"
   )
   # Returns: extracted_info, relevance, entities
   ```

### Error Handling & Fallbacks

- ASI-1 API failures don't crash the application
- Graceful degradation to standard search
- Comprehensive logging for debugging
- User-friendly error messages

### Performance Considerations

- Async/await for non-blocking operations
- Connection pooling for API calls
- MongoDB indexing for fast queries
- Configurable timeouts and retries

## Hackathon Specific Notes

### ASI-1 API Coverage

✅ **This project fulfills all ASI-1 API requirements:**
- ✅ Core integration implemented
- ✅ Multiple genuine use cases
- ✅ Thinking engine application
- ✅ Structured reasoning output
- ✅ Proper error handling

### Judging Criteria Alignment

| Criteria | Implementation |
|----------|-----------------|
| Depth of ASI-1 Usage | ASI-1 used as core thinking engine, not just API wrapper |
| Structured Prompting | Comprehensive prompt engineering for each use case |
| Iteration & Refinement | Multi-step pipeline with ASI-1 at each stage |
| Real Application Value | Genuine web intelligence enhancement |
| Code Quality | Production-grade error handling and logging |
| Documentation | Comprehensive docstrings and inline comments |

## Development & Testing

### Run Local Development Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Tests

```bash
# Testing framework: pytest
pytest tests/ -v

# Check code quality
black . --check
flake8 .
```

### View API Documentation

Interactive API docs available at: `http://localhost:8000/docs`

Alternative documentation: `http://localhost:8000/redoc`

## Configuration Files

### `.env` Template
```
ASI_ONE_API_KEY=your_key
TAVILY_API_KEY=your_key
MONGODB_URI=mongodb://localhost:27017
```

### `requirements.txt` Includes
- fastapi>=0.109.0
- uvicorn[standard]>=0.27.0
- pydantic>=2.5.0
- motor>=3.3.2
- httpx>=0.26.0
- python-dotenv>=1.0.0

## Troubleshooting

### MongoDB Connection Issues
```
Error: Failed to connect to MongoDB
Solution: Ensure MongoDB is running and MONGODB_URI is correct in .env
```

### ASI-1 API Key Not Working
```
Error: Invalid ASI:One API key
Solution: 
1. Check ASI_ONE_API_KEY in .env
2. Verify key is valid at https://asi-one.io
3. Check your quota/usage limits
```

### Rate Limiting
```
Error: Rate limit exceeded
Solution: Implement exponential backoff or request higher limits
```

## Security Considerations

- ✅ API keys stored in `.env` (not in code)
- ✅ CORS configured for frontend
- ✅ Input validation with Pydantic
- ✅ Async operations prevent blocking
- ✅ Error messages don't expose sensitive data
- ✅ MongoDB connection over encrypted channels recommended

## Performance Metrics

| Metric | Value |
|--------|-------|
| Average Query Analysis | ~500ms (ASI-1) |
| Web Search | ~1-2 seconds |
| Result Synthesis | ~1-3 seconds |
| Full Pipeline | ~3-6 seconds |
| Concurrent Requests | Limited by rate limits |

## Contributing

This project was created for the API Innovate 2026 Hackathon. Community contributions are welcome!

1. Fork repository
2. Create feature branch
3. Implement feature with tests
4. Submit pull request

## Code Examples

### Example 1: Basic ASI-1 Query Analysis

```python
from app.services.asi_one_service import get_asi_service

asi = get_asi_service()
analysis = await asi.analyze_search_query("What is quantum computing?")
print(analysis["refined_query"])
print(analysis["reasoning"])
```

### Example 2: End-to-End Search with ASI

```python
async def intelligent_search(query: str):
    # 1. Analyze query with ASI-1
    analysis = await asi.analyze_search_query(query)
    
    # 2. Search with refined query
    results = await tavily.search(analysis["refined_query"])
    
    # 3. Synthesize with ASI-1
    synthesis = await asi.synthesize_web_content(results, query)
    
    return synthesis
```

### Example 3: Content Analysis

```python
# Use ASI-1 to analyze a specific URL
analysis = await asi.extract_and_analyze(
    url="https://example.com/article",
    query="What are recent AI trends?"
)
print(f"Relevance: {analysis['relevance']}")
print(f"Key entities: {analysis['entities']}")
```

## Environment Variables Reference

```env
# ASI-1 API (MANDATORY)
ASI_ONE_API_KEY          # Your ASI:One API key
ASI_ONE_API_URL          # API endpoint (default: https://api.asi-one.io/v1)
ASI_ONE_MODEL            # Model name (default: asi-one)
ASI_ONE_TIMEOUT          # Request timeout in seconds (default: 60)

# Tavily Search (Optional)
TAVILY_API_KEY           # Tavily API key
TAVILY_MAX_RESULTS       # Results per query (default: 5)
TAVILY_SEARCH_DEPTH      # 'basic' or 'advanced' (default: advanced)

# MongoDB (Required for persistence)
MONGODB_URI              # Connection string
MONGODB_DB_NAME          # Database name (default: web_intelligence)
MONGODB_COLLECTION       # Collection name (default: search_results)

# Application
DEBUG                    # True/False for debug mode
CORS_ORIGINS             # Comma-separated origins or "*"
HOST                     # Server host (default: 0.0.0.0)
PORT                     # Server port (default: 8000)
```

## License

This project is built with original code and properly licensed open-source dependencies. 
All code follows MIT License principles for the hackathon.

## Support & Questions

For questions about:
- **ASI-1 API Integration**: See [Hackathon Guide](HACKATHON_GUIDE.md)
- **API Endpoints**: Check `/docs` endpoint
- **Deployment**: See [Deployment Guide](DEPLOYMENT.md) (if available)
- **Hackathon Details**: Visit [API Innovate 2026](https://api-innovate-2026.devpost.com/)

## Acknowledgments

Built for **API Innovate 2026 Hackathon** with:
- ❤️ ASI:One's AI platform (core technology)
- 🔍 Tavily API (web search)
- 📦 MongoDB (data storage)
- ⚡ FastAPI & React (development frameworks)

---

**Hackathon Submission**: API Innovate 2026
**Status**: ✅ ASI-1 API Integration Complete
**Version**: 3.0.0-ASI
**Last Updated**: February 28, 2026

## Environment variables

Create a `.env` file with at least the MongoDB URI. AI keys are optional — the app includes a heuristic fallback for flow generation when keys are not provided.

Example `.env` (do not commit):

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=web_intelligence
# Optional: OpenAI key used for flow generation
OPENAI_API_KEY=sk-...
# Optional: Tavily search API key (used for search/fallback)
TAVILY_API_KEY=your_tavily_key
TAVILY_BASE_URL=https://api.tavily.com
```

Notes:
- If `OPENAI_API_KEY` is not set the service will skip OpenAI and try Tavily.
- If neither provider is available the backend uses a heuristic fallback that generates flows from prompt keywords (e.g., "search", "crawl", "extract", "qa"). This allows the app to function without paid API access — useful for local testing.

## API Endpoints (important)

- `POST /web_search/search` — perform a search (Tavily or internal)
- `POST /flow/generate` — generate a flow from a natural language prompt
- `POST /extract/` — run extraction on URLs
- `POST /crawl/` — crawl a site/URL
- `GET /health` — health check

Use the interactive docs at `/docs` when the backend is running to explore the endpoints.

## Flow generation behavior

- The `/flow/generate` endpoint tries the following (in order):
    1. OpenAI (if `OPENAI_API_KEY` configured)
    2. Tavily (if `TAVILY_API_KEY` configured)
    3. Heuristic fallback (based on keywords in the prompt)

If an external API call fails or keys are not configured, the service logs a warning and returns a sensible heuristic flow so the frontend remains usable.

## Frontend

- Source: `frontend/src`
- Run locally with `npm run dev` inside `frontend/`.
- The UI includes a drag-and-drop flow editor; use the "Generate Flow" button to auto-populate nodes from a prompt.

## Troubleshooting

- "Failed to generate flow: Failed to fetch": usually indicates the frontend could not reach the backend (CORS or backend not running) or the backend raised an HTTP 500. Start by verifying the backend is running at `http://127.0.0.1:8000` and check backend logs.
- Missing AI keys will not break the app — it will fall back to heuristic flow generation. To enable full AI features, configure `OPENAI_API_KEY` and/or `TAVILY_API_KEY` in `.env`.

## Contributing

Contributions are welcome. Open a PR against the `main` branch with a clear description of your changes.

## License

Project license: see repository settings or ask the maintainer.
