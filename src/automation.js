import tavilyService from './services/tavily.js';
import mongoDBService from './db/mongodb.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


class WebScrapingAutomation {
    constructor() {
        this.results = [];
        this.errors = [];
    }

    async runWithQueries(queries, options = {}) {
        console.log('\n Starting Web Scraping Automation\n');
        console.log('='.repeat(50));

        try {
            await mongoDBService.connect();

            const searchResults = await tavilyService.batchSearch(queries, options);
            this.results = searchResults.results;
            this.errors = searchResults.errors;

            if (this.results.length > 0) {
                console.log('\n Storing results in MongoDB...');
                await mongoDBService.insertBatchResults(this.results);
            }

            this.printSummary();

            if (options.export) {
                await this.exportResults(options.exportFormat || 'json');
            }

            return {
                results: this.results,
                errors: this.errors,
                summary: searchResults.summary
            };
        } catch (error) {
            console.error('\n Automation error:', error.message);
            throw error;
        } finally {
            await mongoDBService.close();
        }
    }

    async runWithFile(filePath, options = {}) {
        try {
            console.log(` Reading queries from: ${filePath}`);

            const content = fs.readFileSync(filePath, 'utf-8');
            const queries = content
                .split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));

            console.log(` Loaded ${queries.length} queries from file\n`);

            return await this.runWithQueries(queries, options);
        } catch (error) {
            console.error(' Error reading file:', error.message);
            throw error;
        }
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log(' AUTOMATION SUMMARY');
        console.log('='.repeat(50));
        console.log(` Successful searches: ${this.results.length}`);
        console.log(` Failed searches: ${this.errors.length}`);
        console.log(` Total results collected: ${this.results.reduce((sum, r) => sum + r.results.length, 0)}`);

        if (this.errors.length > 0) {
            console.log('\n  Errors:');
            this.errors.forEach(err => {
                console.log(`   - "${err.query}": ${err.error}`);
            });
        }

        console.log('='.repeat(50) + '\n');
    }

    async exportResults(format = 'json') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `tavily_results_${timestamp}.${format}`;
            const filepath = `./exports/${filename}`;

            if (!fs.existsSync('./exports')) {
                fs.mkdirSync('./exports');
            }

            if (format === 'json') {
                fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
            } else if (format === 'csv') {
                const csv = this.convertToCSV(this.results);
                fs.writeFileSync(filepath, csv);
            }

            console.log(`📦 Results exported to: ${filepath}`);
            return filepath;
        } catch (error) {
            console.error(' Error exporting results:', error.message);
            throw error;
        }
    }

    convertToCSV(results) {
        const rows = [];
        rows.push('Query,Answer,Title,URL,Content,Score');

        results.forEach(result => {
            const query = this.escapeCSV(result.query);
            const answer = this.escapeCSV(result.answer);

            result.results.forEach(item => {
                rows.push([
                    query,
                    answer,
                    this.escapeCSV(item.title),
                    this.escapeCSV(item.url),
                    this.escapeCSV(item.content),
                    item.score
                ].join(','));
            });
        });

        return rows.join('\n');
    }


    escapeCSV(field) {
        if (field === null || field === undefined) return '';
        return `"${String(field).replace(/"/g, '""')}"`;
    }
    async viewStoredResults(limit = 10) {
        try {
            await mongoDBService.connect();
            const results = await mongoDBService.getAllResults(limit);

            console.log(`\n Recent ${results.length} results from MongoDB:\n`);
            results.forEach((result, idx) => {
                console.log(`${idx + 1}. Query: "${result.query}"`);
                console.log(`   Answer: ${result.answer.substring(0, 100)}...`);
                console.log(`   Results: ${result.results.length}`);
                console.log(`   Timestamp: ${result.timestamp}\n`);
            });

            await mongoDBService.close();
            return results;
        } catch (error) {
            console.error(' Error viewing results:', error.message);
            throw error;
        }
    }

    async getStats() {
        try {
            await mongoDBService.connect();
            const stats = await mongoDBService.getStats();

            console.log('\n Database Statistics:');
            console.log(`   Total results: ${stats.totalResults}`);
            console.log(`   Results (last 24h): ${stats.resultsLast24h}\n`);

            await mongoDBService.close();
            return stats;
        } catch (error) {
            console.error(' Error getting stats:', error.message);
            throw error;
        }
    }
}


async function main() {
    const automation = new WebScrapingAutomation();

    const sampleQueries = [
        'Latest AI developments in 2026',
    ];

    try {
        const results = await automation.runWithQueries(sampleQueries, {
            export: true,
            exportFormat: 'json',
            searchDepth: 'advanced',
            maxResults: 5
        });

        console.log('\n Automation completed successfully!');

        await automation.getStats();

    } catch (error) {
        console.error('\n Automation failed:', error.message);
        process.exit(1);
    }

}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default WebScrapingAutomation;
