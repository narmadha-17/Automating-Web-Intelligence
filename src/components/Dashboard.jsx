import React, { useState, useCallback } from 'react';
import { SearchPanel } from './SearchPanel';
import { StatsPanel } from './StatsPanel';
import { ResultsPanel } from './ResultsPanel';
import '../styles/dashboard.css';

export default function Dashboard() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalSearches: 0,
        totalResults: 0,
        successRate: 100
    });
    const [history, setHistory] = useState([]);

    const handleSearch = useCallback(async (searchData) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchData)
            });

            const data = await response.json();

            if (data.success) {
                setResults(data.results);
                
                // Update stats
                setStats({
                    totalSearches: stats.totalSearches + 1,
                    totalResults: stats.totalResults + data.summary.totalResultsFound,
                    successRate: 100
                });

                // Update history
                setHistory(prev => [
                    {
                        timestamp: new Date().toLocaleString(),
                        queries: searchData.queries,
                        count: data.results.length
                    },
                    ...prev
                ].slice(0, 10));
            } else {
                setError(data.error || 'Search failed');
            }
        } catch (error) {
            setError('Error performing search: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [stats]);

    const handleCopy = (result) => {
        const text = JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/api/export?format=json');
            const data = await response.json();
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tavily_results_${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            setError('Error exporting results: ' + error.message);
        }
    };

    return (
        <div className="container">
            <header>
                <h1>🔍 Tavily Web Intelligence</h1>
                <p>Automated Web Scraping & Research Powered by AI</p>
            </header>

            {error && (
                <div className="alert alert-error">
                    
                    <span>{error}</span>
                </div>
            )}

            <div className="main-grid">
                <SearchPanel onSearch={handleSearch} isLoading={loading} />
                <StatsPanel stats={stats} history={history} onExport={handleExport} />
            </div>

            <ResultsPanel results={results} onCopy={handleCopy} />
        </div>
    );
}
