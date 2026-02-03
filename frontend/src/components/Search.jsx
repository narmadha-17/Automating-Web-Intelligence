import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Search = () => {
    const [queries, setQueries] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleQueryChange = (index, value) => {
        const newQueries = [...queries];
        newQueries[index] = value;
        setQueries(newQueries);
    };

    const addQuery = () => setQueries([...queries, '']);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/web_search/search`, {
                queries: queries.filter(q => q.trim() !== ''),
                search_depth: 'advanced',
                include_answer: true
            });
            setResults(response.data);
        } catch (err) {
            console.error('Search error:', err);
            const detail = err.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') :
                    (detail ? JSON.stringify(detail) : err.message));
            setError(errorMsg || 'An error occurred during search');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-scale-in hover-glow" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>AI Powered Search</h3>
            <form onSubmit={handleSearch}>
                {queries.map((query, index) => (
                    <input
                        key={index}
                        className="input-glass"
                        placeholder="Enter search query..."
                        value={query}
                        onChange={(e) => handleQueryChange(index, e.target.value)}
                    />
                ))}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button type="button" onClick={addQuery} className="btn-primary" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-glass)' }}>
                        + Add Query
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Searching...' : 'Perform Search'}
                    </button>
                </div>
            </form>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 className="gradient-text">Results Summary</h4>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Successful: {results.summary.successful} | Failed: {results.summary.failed}
                    </p>

                    <div style={{ marginTop: '1.5rem' }}>
                        {results.results.map((result, idx) => (
                            <div key={idx} style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
                                <h5 style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}>{result.query}</h5>
                                {result.answer && (
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', margin: '1rem 0' }}>
                                        <strong>AI Answer:</strong> {result.answer}
                                    </div>
                                )}
                                {result.results.map((r, rIdx) => (
                                    <div key={rIdx} style={{ margin: '0.75rem 0' }}>
                                        <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>{r.title}</a>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{r.content.substring(0, 200)}...</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;
