# Web Intelligence API

**FastAPI-powered web intelligence gathering using Tavily's AI-powered search API with MongoDB storage**

##  Overview

This is a production-ready FastAPI application that provides AI-powered web search capabilities through the Tavily API. It features automatic MongoDB storage, comprehensive request validation using Pydantic, and a clean RESTful API design.

##  Features

- ** AI-Powered Search** - Leverage Tavily's advanced AI search capabilities
- ** Batch Processing** - Process multiple queries in a single request
- ** MongoDB Storage** - Automatic storage of all search results with timestamps
- ** Request Validation** - Comprehensive validation using Pydantic models
- ** Error Handling** - Robust error handling with detailed logging
- ** Auto Documentation** - Interactive API docs (Swagger UI & ReDoc)
- ** Async Operations** - Fully asynchronous for high performance
- ** CORS Support** - Built-in CORS middleware

##  Architecture

```
┌─────────────────────────────────────┐
│      FastAPI Application            │
│   /web_search/search endpoint       │
└──────────┬───────────────────┬──────┘
           │                   │
    ┌──────▼──────┐    ┌──────▼──────┐
    │   Tavily    │    │   MongoDB   │
    │   Service   │    │   Service   │
    │  (httpx)    │    │   (motor)   │
    └─────────────┘    └─────────────┘
```
