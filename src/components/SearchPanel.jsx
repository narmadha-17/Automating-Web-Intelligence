import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';

export function SearchPanel({ onSearch, isLoading }) {
    const [queries, setQueries] = useState('');
    const [searchDepth, setSearchDepth] = useState('advanced');
    const [maxResults, setMaxResults] = useState('5');
    const [error, setError] = useState('');

    const handleSearch = () => {
        const queryList = queries.split('\n').filter(q => q.trim());

        if (queryList.length === 0) {
            setError('Please enter at least one search query');
            return;
        }

        setError('');
        onSearch({
            queries: queryList,
            searchDepth,
            maxResults: parseInt(maxResults)
        });
    };

    return (
        <div className="card">
            <h2>
                <span>🚀</span> Search Queries
            </h2>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="queries">Enter Queries (one per line)</label>
                <textarea
                    id="queries"
                    value={queries}
                    onChange={(e) => setQueries(e.target.value)}
                    placeholder="Latest AI developments in 2026&#10;Web scraping best practices&#10;MongoDB performance optimization&#10;..."
                />
            </div>

            <div className="form-group">
                <label>Search Options</label>
                <div className="option-group">
                    <div>
                        <label htmlFor="searchDepth" style={{ marginBottom: '8px' }}>
                            Search Depth
                        </label>
                        <select
                            id="searchDepth"
                            value={searchDepth}
                            onChange={(e) => setSearchDepth(e.target.value)}
                        >
                            <option value="basic">Basic</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="maxResults" style={{ marginBottom: '8px' }}>
                            Max Results
                        </label>
                        <select
                            id="maxResults"
                            value={maxResults}
                            onChange={(e) => setMaxResults(e.target.value)}
                        >
                            <option value="3">3 Results</option>
                            <option value="5">5 Results</option>
                            <option value="10">10 Results</option>
                            <option value="20">20 Results</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="button-group">
                <button
                    className="btn-primary"
                    onClick={handleSearch}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            <span className="loading">Searching...</span>
                        </>
                    ) : (
                        <>
                            <Search size={20} />
                            Start Search
                        </>
                    )}
                </button>
                <button
                    className="btn-secondary"
                    onClick={() => setQueries('')}
                    disabled={isLoading}
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
