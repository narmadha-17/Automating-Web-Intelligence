import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

class MongoDBService {
    constructor() {
        this.client = null;
        this.db = null;
        this.collection = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) {
            console.log('Already connected to MongoDB');
            return;
        }

        try {
            const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
            const dbName = process.env.MONGODB_DATABASE || 'automating_web_intellegence';
            const collectionName = process.env.MONGODB_COLLECTION || 'automating_web_intellegence';

            console.log(` Connecting to MongoDB at ${uri}...`);

            this.client = new MongoClient(uri);
            await this.client.connect();

            this.db = this.client.db(dbName);
            this.collection = this.db.collection(collectionName);
            this.isConnected = true;

            console.log(` Connected to MongoDB: ${dbName}.${collectionName}`);
        } catch (error) {
            console.error('MongoDB connection error:', error.message);
            throw error;
        }
    }

    async insertSearchResult(result) {
        try {
            await this.ensureConnected();

            const document = {
                ...result,
                timestamp: new Date(),
                _metadata: {
                    insertedAt: new Date(),
                    source: 'tavily-automation'
                }
            };

            const insertResult = await this.collection.insertOne(document);
            console.log(` Inserted result with ID: ${insertResult.insertedId}`);

            return insertResult;
        } catch (error) {
            console.error(' Error inserting search result:', error.message);
            throw error;
        }
    }


    async insertBatchResults(results) {
        try {
            await this.ensureConnected();

            const documents = results.map(result => ({
                ...result,
                timestamp: new Date(),
                _metadata: {
                    insertedAt: new Date(),
                    source: 'tavily-automation'
                }
            }));

            if (documents.length === 0) {
                console.log('⚠️  No results to insert');
                return { insertedCount: 0 };
            }

            const insertResult = await this.collection.insertMany(documents);
            console.log(`✅ Inserted ${insertResult.insertedCount} results`);

            return insertResult;
        } catch (error) {
            console.error('❌ Error inserting batch results:', error.message);
            throw error;
        }
    }


    async findByQuery(query) {
        try {
            await this.ensureConnected();

            const results = await this.collection
                .find({ query: { $regex: query, $options: 'i' } })
                .sort({ timestamp: -1 })
                .toArray();

            console.log(`📊 Found ${results.length} results for query: "${query}"`);
            return results;
        } catch (error) {
            console.error('❌ Error finding results:', error.message);
            throw error;
        }
    }


    async getAllResults(limit = 100) {
        try {
            await this.ensureConnected();

            const results = await this.collection
                .find({})
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();

            console.log(`📊 Retrieved ${results.length} results`);
            return results;
        } catch (error) {
            console.error('❌ Error retrieving results:', error.message);
            throw error;
        }
    }

    async getStats() {
        try {
            await this.ensureConnected();

            const totalCount = await this.collection.countDocuments();
            const recentCount = await this.collection.countDocuments({
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            return {
                totalResults: totalCount,
                resultsLast24h: recentCount
            };
        } catch (error) {
            console.error('❌ Error getting stats:', error.message);
            throw error;
        }
    }

    async clearAll() {
        try {
            await this.ensureConnected();

            const result = await this.collection.deleteMany({});
            console.log(`🗑️  Deleted ${result.deletedCount} results`);

            return result;
        } catch (error) {
            console.error('❌ Error clearing results:', error.message);
            throw error;
        }
    }

    async ensureConnected() {
        if (!this.isConnected) {
            await this.connect();
        }
    }
    async close() {
        if (this.client && this.isConnected) {
            await this.client.close();
            this.isConnected = false;
            console.log('👋 MongoDB connection closed');
        }
    }
}

export default new MongoDBService();
