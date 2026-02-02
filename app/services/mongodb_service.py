from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta

from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDBService:
    _instance = None
    _client: Optional[AsyncIOMotorClient] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.uri = settings.MONGODB_URI
            self.db_name = settings.MONGODB_DB_NAME
            self.collection_name = settings.MONGODB_COLLECTION
            self.db = None
            self.collection = None
            self.initialized = True
    
    async def connect(self):

        if self._client is None:
            try:
                logger.info(f"Connecting to MongoDB at {self.uri[:20]}...")
                self._client = AsyncIOMotorClient(self.uri)
                
                await self._client.admin.command('ping')
                
                self.db = self._client[self.db_name]
                self.collection = self.db[self.collection_name]
                
                logger.info(f" Connected to MongoDB database: {self.db_name}")
                
            except Exception as e:
                logger.error(f"Failed to connect to MongoDB: {e}")
                raise
    
    async def close(self):

        if self._client:
            self._client.close()
            self._client = None
            logger.info("MongoDB connection closed")
    
    async def insert_search_result(self, result: Dict[str, Any]) -> str:

        try:
            if "timestamp" not in result:
                result["timestamp"] = datetime.utcnow()
            
            insert_result = await self.collection.insert_one(result)
            logger.info(f"Inserted search result for query: '{result.get('query', 'unknown')}'")
            return str(insert_result.inserted_id)
            
        except Exception as e:
            logger.error(f"Error inserting search result: {e}")
            raise
    
    async def insert_batch_results(self, results: List[Dict[str, Any]]) -> List[str]:

        if not results:
            return []
        
        try:
            for result in results:
                if "timestamp" not in result:
                    result["timestamp"] = datetime.utcnow()
            
            insert_result = await self.collection.insert_many(results)
            inserted_ids = [str(id) for id in insert_result.inserted_ids]
            logger.info(f" Inserted {len(inserted_ids)} search results into MongoDB")
            return inserted_ids
            
        except Exception as e:
            logger.error(f"Error inserting batch results: {e}")
            raise
    
    async def get_all_results(self, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            cursor = self.collection.find().sort("timestamp", -1).limit(limit)
            results = await cursor.to_list(length=limit)
            
            for result in results:
                if "_id" in result:
                    result["_id"] = str(result["_id"])
            
            logger.info(f"Retrieved {len(results)} results from MongoDB")
            return results
            
        except Exception as e:
            logger.error(f"Error retrieving results: {e}")
            raise
    
    async def get_stats(self) -> Dict[str, Any]:

        try:
            total_count = await self.collection.count_documents({})
            yesterday = datetime.utcnow() - timedelta(days=1)
            recent_count = await self.collection.count_documents({
                "timestamp": {"$gte": yesterday}
            })
            
            stats = {
                "total_results": total_count,
                "results_last_24h": recent_count,
                "database": self.db_name,
                "collection": self.collection_name
            }
            
            logger.info(f"Stats: {total_count} total, {recent_count} in last 24h")
            return stats
            
        except Exception as e:
            logger.error(f"Error getting stats: {e}")
            raise
    
    async def search_by_query(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:

        try:
            cursor = self.collection.find(
                {"query": {"$regex": query, "$options": "i"}}
            ).sort("timestamp", -1).limit(limit)
            
            results = await cursor.to_list(length=limit)
            
            for result in results:
                if "_id" in result:
                    result["_id"] = str(result["_id"])
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching by query: {e}")
            raise

    async def save_crawl_results(self, results: Dict[str, Any]) -> str:
        try:
            if "timestamp" not in results:
                results["timestamp"] = datetime.utcnow()
            results["type"] = "crawl"
            
            insert_result = await self.collection.insert_one(results)
            logger.info(f"Inserted crawl results for base URL: {results.get('base_url')}")
            return str(insert_result.inserted_id)
        except Exception as e:
            logger.error(f"Error saving crawl results: {e}")
            raise

    async def save_map_results(self, results: Dict[str, Any]) -> str:
        try:
            results["timestamp"] = datetime.utcnow()
            results["type"] = "map"
            
            insert_result = await self.collection.insert_one(results)
            logger.info(f"Inserted map results for base URL: {results.get('base_url')}")
            return str(insert_result.inserted_id)
        except Exception as e:
            logger.error(f"Error saving map results: {e}")
            raise


mongodb_service = MongoDBService()
