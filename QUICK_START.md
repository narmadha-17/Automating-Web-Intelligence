# 🎯 Quick Start Guide

## Prerequisites
- ✅ Python 3.9+ installed
- ✅ MongoDB running (locally or remote)
- ✅ Tavily API key ([Get one here](https://tavily.com))

## Installation (5 minutes)

### 1. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
The `.env` file is already configured with your existing API key. Just verify:
```bash
# Check if MongoDB URI is correct
# Check if TAVILY_API_KEY is set
```

### 4. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or connect to your remote MongoDB using the URI in .env
```

### 5. Run the Server
```bash
uvicorn main:app --reload
```

Server will start at: **http://localhost:8000**

## 🧪 Test the API

### Option 1: Interactive Documentation (Recommended)
Open your browser: **http://localhost:8000/docs**

1. Click on `/web_search/search` endpoint
2. Click "Try it out"
3. Enter your request JSON
4. Click "Execute"

### Option 2: Using the Example Script
```bash
# Test health and validation
python example_usage.py

# For full testing (uncomment search functions in the script first)
```

### Option 3: Using curl
```bash
curl -X POST "http://localhost:8000/web_search/search" \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["Latest AI developments"],
    "search_depth": "advanced",
    "max_results": 5
  }'
```

## 📍 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/web_search/search` | Main search endpoint |
| GET | `/web_search/results` | Get recent results |
| GET | `/web_search/stats` | Get statistics |
| GET | `/health` | Health check |
| GET | `/docs` | Interactive API docs |

## 🎨 Example Request

```json
{
  "queries": [
    "Latest AI developments in 2026",
    "Python FastAPI best practices"
  ],
  "search_depth": "advanced",
  "max_results": 5,
  "include_answer": true
}
```

## ✅ All Tasks Completed

- [x] Created FastAPI application with lifespan management
- [x] Implemented `/web_search/search` endpoint
- [x] Added Pydantic models for validation
- [x] Created async Tavily service
- [x] Created async MongoDB service
- [x] Added comprehensive error handling
- [x] Generated automatic API documentation
- [x] Created example scripts
- [x] Removed all old Node.js/React files
- [x] Updated all documentation

## 📁 Project Structure

```
Automating-Web-Intelligence/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   └── search.py         # Main endpoint
│   │   └── models/
│   │       └── search.py         # Validation models
│   ├── services/
│   │   ├── tavily_service.py     # Tavily API
│   │   └── mongodb_service.py    # MongoDB
│   └── core/
│       └── config.py             # Configuration
├── main.py                       # FastAPI app
├── requirements.txt              # Dependencies
├── example_usage.py              # Usage examples
├── .env                          # Your config (with API key)
├── .env.example                  # Template
└── README.md                     # Full documentation
```

## 🚀 Deployment

For production:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📚 Documentation

- **README.md** - Complete project documentation
- **http://localhost:8000/docs** - Interactive API documentation (Swagger UI)
- **http://localhost:8000/redoc** - Alternative API documentation (ReDoc)

## 💡 Next Steps

1. Test the API using `/docs`
2. Make your first search request
3. Check the MongoDB database for stored results
4. Integrate with your applications

---

**Ready to use!** 🎉

Start the server and visit http://localhost:8000/docs
