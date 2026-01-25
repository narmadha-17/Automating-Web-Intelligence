import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class TavilyService {
    constructor() {
        this.apiKey = process.env.TAVILY_API_KEY;
        this.baseUrl = 'https://api.tavily.com';
        this.maxResults = parseInt(process.env.MAX_RESULTS) || 5;
        this.searchDepth = process.env.SEARCH_DEPTH || 'advanced';

        if (!this.apiKey) {
            console.warn('  TAVILY_API_KEY not found in environment variables ');
        }
    }


    async search(query, options = {}) {
        if (!this.apiKey || this.apiKey === process.env.TAVILY_API_KEY) {
            throw new Error('Please set a valid TAVILY_API_KEY in your .env file tavily.js');
        }

        try {
            console.log(` Searching Tavily for: "${query}"`);

            const payload = {
                api_key: this.apiKey,
                query: query,
                search_depth: options.searchDepth || this.searchDepth,
                max_results: options.maxResults || this.maxResults,
                include_answer: options.includeAnswer !== false,
                include_raw_content: options.includeRawContent || false,
                include_images: options.includeImages || false,
                ...options.advanced
            };

            const response = await axios.post(`${this.baseUrl}/search`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds timeout
            });

            if (response.data) {
                console.log(` Found ${response.data.results?.length || 0} results for: "${query}"`);
                return this.formatResponse(query, response.data);
            }

            throw new Error('Empty response from Tavily API');
        } catch (error) {
            if (error.response) {
                // API returned an error
                const status = error.response.status;
                const message = error.response.data?.error || error.message;

                if (status === 401) {
                    throw new Error('Invalid Tavily API key. Please check your TAVILY_API_KEY in .env file');
                } else if (status === 429) {
                    throw new Error('Rate limit exceeded. Please wait before making more requests');
                } else {
                    throw new Error(`Tavily API error (${status}): ${message}`);
                }
            } else if (error.request) {
                throw new Error('No response from Tavily API. Please check your internet connection');
            } else {
                throw new Error(`Search error: ${error.message}`);
            }
        }
    }


    async batchSearch(queries, options = {}) {
        const results = [];
        const errors = [];

        console.log(` Starting batch search for ${queries.length} queries`);

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];

            try {
                console.log(`\n[${i + 1}/${queries.length}] Processing: "${query}"`);
                const result = await this.search(query, options);
                results.push(result);

                // Small delay to avoid rate limiting
                if (i < queries.length - 1) {
                    await this.delay(1000);
                }
            } catch (error) {
                console.error(` Error searching "${query}":`, error.message);
                errors.push({
                    query,
                    error: error.message
                });
            }
        }

        console.log(`\n Batch search complete: ${results.length} successful, ${errors.length} failed`);

        return {
            results,
            errors,
            summary: {
                total: queries.length,
                successful: results.length,
                failed: errors.length
            }
        };
    }

    /**
     * Format API response
     */
    formatResponse(query, data) {
        return {
            query: query,
            answer: data.answer || 'No AI answer provided',
            results: (data.results || []).map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score || 0,
                publishedDate: result.published_date || null
            })),
            images: data.images || [],
            followUpQuestions: data.follow_up_questions || [],
            searchMetadata: {
                searchDepth: this.searchDepth,
                resultCount: data.results?.length || 0,
                searchedAt: new Date().toISOString()
            }
        };
    }

    extractUrls(searchResult) {
        return searchResult.results.map(r => r.url);
    }

    async getAnswer(query) {
        const result = await this.search(query, {
            maxResults: 3,
            searchDepth: 'basic'
        });
        return result.answer;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async validateApiKey() {
        try {
            await this.search('test', { maxResults: 1 });
            console.log(' Tavily API key is valid');
            return true;
        } catch (error) {
            console.error(' Tavily API key validation failed:', error.message);
            return false;
        }
    }
}

export default new TavilyService();
