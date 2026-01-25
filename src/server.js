import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import tavilyService from './services/tavily.js';
import mongoDBService from './db/mongodb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.post('/api/search', async (req, res) => {
    try {
        const { queries, searchDepth = 'advanced', maxResults = 5 } = req.body;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Queries array is required'
            });
        }

        console.log(` Performing search for ${queries.length} queries...`);

        const results = [];
        const errors = [];

        await mongoDBService.connect();
        for (const query of queries) {
            try {
                const result = await tavilyService.search(query, {
                    searchDepth,
                    maxResults,
                    includeAnswer: true
                });

                results.push(result);

                await mongoDBService.insertSearchResult(result);
            } catch (error) {
                console.error(` Error searching for "${query}":`, error.message);
                errors.push({
                    query,
                    error: error.message
                });
            }
        }

        await mongoDBService.close();

        res.json({
            success: true,
            results,
            errors,
            summary: {
                totalQueries: queries.length,
                successfulSearches: results.length,
                failedSearches: errors.length,
                totalResultsFound: results.reduce((sum, r) => sum + (r.results?.length || 0), 0)
            }
        });
    } catch (error) {
        console.error(' Search error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/results', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        await mongoDBService.connect();
        const results = await mongoDBService.getAllResults(limit);
        await mongoDBService.close();

        res.json({
            success: true,
            results,
            count: results.length
        });
    } catch (error) {
        console.error(' Error fetching results:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        await mongoDBService.connect();
        const stats = await mongoDBService.getStats();
        await mongoDBService.close();

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error(' Error fetching stats:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/export', async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const limit = parseInt(req.query.limit) || 100;

        await mongoDBService.connect();
        const results = await mongoDBService.getAllResults(limit);
        await mongoDBService.close();

        if (format === 'csv') {
            const csv = convertToCSV(results);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="tavily_results.csv"');
            res.send(csv);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="tavily_results.json"');
            res.json(results);
        }
    } catch (error) {
        console.error(' Error exporting:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


app.post('/api/batch-search', async (req, res) => {
    try {
        const { queries, searchDepth = 'advanced', maxResults = 5 } = req.body;

        if (!queries || !Array.isArray(queries) || queries.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Queries array is required'
            });
        }

        console.log(` Starting batch search for ${queries.length} queries...`);

        const results = [];
        const errors = [];
        const startTime = Date.now();

        await mongoDBService.connect();

        for (const query of queries) {
            try {
                const result = await tavilyService.search(query, {
                    searchDepth,
                    maxResults,
                    includeAnswer: true
                });

                results.push(result);
                await mongoDBService.insertSearchResult(result);
            } catch (error) {
                errors.push({
                    query,
                    error: error.message
                });
            }
        }

        await mongoDBService.close();

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        res.json({
            success: true,
            results,
            errors,
            summary: {
                totalQueries: queries.length,
                successfulSearches: results.length,
                failedSearches: errors.length,
                totalResultsFound: results.reduce((sum, r) => sum + (r.results?.length || 0), 0),
                durationSeconds: duration
            }
        });
    } catch (error) {
        console.error(' Batch search error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/history', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        await mongoDBService.connect();
        const history = await mongoDBService.getSearchHistory(limit);
        await mongoDBService.close();

        res.json({
            success: true,
            history,
            count: history.length
        });
    } catch (error) {
        console.error(' Error fetching history:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

app.use((error, req, res, next) => {
    console.error(' Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

function convertToCSV(results) {
    const rows = [];
    rows.push('Query,Answer,Title,URL,Content,Score,Timestamp');

    results.forEach(result => {
        const query = escapeCSV(result.query);
        const answer = escapeCSV(result.answer || '');

        result.results.forEach(item => {
            rows.push([
                query,
                answer,
                escapeCSV(item.title),
                escapeCSV(item.url),
                escapeCSV(item.content),
                item.score,
                result.timestamp || ''
            ].join(','));
        });
    });

    return rows.join('\n');
}

function escapeCSV(field) {
    if (field === null || field === undefined) return '';
    return `"${String(field).replace(/"/g, '""')}"`;
}

const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log(' Tavily Web Intelligence Server Started');
    console.log('='.repeat(60));
    console.log(` Server: http://localhost:${PORT}`);
    console.log(` Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60) + '\n');
});

process.on('SIGTERM', async () => {
    console.log('\n⏸  SIGTERM received. Shutting down gracefully...');
    server.close(async () => {
        console.log(' Server closed');
        try {
            await mongoDBService.close();
            console.log(' MongoDB connection closed');
        } catch (error) {
            console.error(' Error closing MongoDB:', error);
        }
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('\n⏸  SIGINT received. Shutting down gracefully...');
    server.close(async () => {
        console.log(' Server closed');
        try {
            await mongoDBService.close();
            console.log(' MongoDB connection closed');
        } catch (error) {
            console.error(' Error closing MongoDB:', error);
        }
        process.exit(0);
    });
});

export default app;
