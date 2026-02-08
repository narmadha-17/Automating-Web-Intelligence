import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Search = ({ apiKey, activeTab }) => {
    const [queries, setQueries] = useState(['']);
    const [loading, setLoading] = useState(false);
    const [beautifyLoading, setBeautifyLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [beautifiedIndexes, setBeautifiedIndexes] = useState([]);

    const handleQueryChange = (index, value) => {
        const newQueries = [...queries];
        newQueries[index] = value;
        setQueries(newQueries);
        setBeautifiedIndexes(prev => prev.filter(i => i !== index));
    };

    const addQuery = () => setQueries([...queries, '']);

    const removeQuery = (index) => {
        if (queries.length > 1) {
            setQueries(queries.filter((_, i) => i !== index));
        }
    };

    const handleBeautify = async (index) => {
        const queryToCorrect = queries[index];
        if (!queryToCorrect || !queryToCorrect.trim()) {
            return;
        }

        setBeautifyLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/beautify/correct`, {
                queries: [queryToCorrect]
            });
            const corrected = response.data.corrected_queries[0];

            if (corrected !== queryToCorrect) {
                const newQueries = [...queries];
                newQueries[index] = corrected;
                setQueries(newQueries);

                if (!beautifiedIndexes.includes(index)) {
                    setBeautifiedIndexes(prev => [...prev, index]);
                }

                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Beautify error:', err);
            const detail = err.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') :
                    (detail ? JSON.stringify(detail) : err.message));
            setError(errorMsg || 'Failed to beautify text. Please try again.');
        } finally {
            setBeautifyLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/web_search/search`, {
                queries: queries.filter(q => q.trim() !== ''),
                search_depth: 'advanced',
                include_answer: true,
                api_key: apiKey
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
        <div className="animate-slide-up">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                {showSuccess && (
                    <div style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        background: '#10B981',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        zIndex: 100,
                        animation: 'slide-up 0.3s ease-out'
                    }}>
                        ✨ Text beautified successfully!
                    </div>
                )}

                <h3 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                    Multi-Query Search
                </h3>

                <form onSubmit={handleSearch}>
                    {queries.map((query, index) => (
                        <div key={index} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="glass-input"
                                placeholder="Enter search query..."
                                value={query}
                                onChange={(e) => handleQueryChange(index, e.target.value)}
                                style={{
                                    borderColor: beautifiedIndexes.includes(index) ? '#10B981' : undefined,
                                    boxShadow: beautifiedIndexes.includes(index) ? '0 0 10px rgba(16, 185, 129, 0.2)' : undefined,
                                    flex: 1
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => handleBeautify(index)}
                                disabled={beautifyLoading || !query.trim()}
                                className="btn btn-magic"
                                style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Beautify Query"
                            >
                                {beautifyLoading ? '✨' : '✨'}
                            </button>
                            {queries.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuery(index)}
                                    className="btn-ghost"
                                    style={{ color: '#EF4444' }}
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                        <button type="button" onClick={addQuery} className="btn btn-ghost" style={{ border: '1px solid var(--border-glass)' }}>
                            + Add Query
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ marginLeft: 'auto' }}
                        >
                            {loading ? ' Searching...' : ' Perform Search'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#EF4444'
                    }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 className="text-gradient" style={{ fontSize: '1.2rem' }}>Results</h4>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Success: <span style={{ color: '#10B981' }}>{results.summary.successful}</span> •
                            Failed: <span style={{ color: '#EF4444' }}>{results.summary.failed}</span>
                        </span>
                    </div>

                    {results.results.map((result, idx) => (
                        <div key={idx} className="result-card animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <h5 style={{ color: 'var(--color-primary)', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>🔎</span> {result.query}
                            </h5>

                            {result.answer && (
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    borderLeft: '2px solid var(--color-secondary)'
                                }}>
                                    <strong style={{ color: 'var(--color-secondary)', fontSize: '0.9rem', display: 'block', marginBottom: '0.25rem' }}>AI Answer:</strong>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{result.answer}</p>
                                </div>
                            )}

                            <div>
                                {result.results.map((r, rIdx) => (
                                    <a
                                        key={rIdx}
                                        href={r.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'block', textDecoration: 'none', marginBottom: '1rem', padding: '0.5rem', borderRadius: '4px', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ color: 'var(--color-primary-hover)', fontWeight: '500', marginBottom: '0.2rem' }}>{r.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.content.substring(0, 180)}...</div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search;
