import pytest
import os

# Set test environment variables before importing app modules
os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGODB_DB_NAME", "test_web_intelligence")
