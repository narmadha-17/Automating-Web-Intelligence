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

    const handleBeautify = async () => {
        const nonEmptyQueries = queries.filter(q => q.trim() !== '');
        if (nonEmptyQueries.length === 0) {
            setError('Please enter at least one query to beautify');
            return;
        }

        setBeautifyLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/beautify/correct`, {
                queries: nonEmptyQueries
            });
            const corrected = response.data.corrected_queries;

            // Map corrected queries back to the list, keeping empty ones as is
            let correctedIdx = 0;
            const changedIndexes = [];
            const newQueries = queries.map((q, idx) => {
                if (q.trim() === '') return q;
                const newValue = corrected[correctedIdx++];
                if (newValue !== q) {
                    changedIndexes.push(idx);
                }
                return newValue;
            });

            setQueries(newQueries);
            setBeautifiedIndexes(changedIndexes);

            // Show success toast if any changes were made
            if (changedIndexes.length > 0) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (err) {
            console.error('Beautify error:', err);
            setError('Failed to beautify text. Please try again.');
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
        <div className="search-container" style={{ maxWidth: '800px', margin: '2rem auto', position: 'relative' }}>
            <div className="search-bg-mesh"></div>
            <div className="search-bg-aurora"></div>

            <div className="search-orb search-orb-1"></div>
            <div className="search-orb search-orb-2"></div>
            <div className="search-orb search-orb-3"></div>

            <div className="search-particles">
                <div className="search-particle"></div>
                <div className="search-particle"></div>
                <div className="search-particle"></div>
                <div className="search-particle"></div>
                <div className="search-particle"></div>
                <div className="search-particle"></div>
            </div>

            <div className="search-bg-grid"></div>

            <div className="search-bg-noise"></div>

            <div className="glass-card animate-scale-in hover-glow">
                {showSuccess && (
                    <div className="success-toast">
                        <span style={{ fontSize: '1.2rem' }}>✨</span>
                        <span>Text beautified successfully!</span>
                    </div>
                )}

                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="gradient-text">AI Powered Search</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                        with spell correction
                    </span>
                </h3>

                <form onSubmit={handleSearch}>
                    {queries.map((query, index) => (
                        <div key={index} className="query-input-wrapper">
                            <input
                                className={`input-glass ${beautifiedIndexes.includes(index) ? 'input-beautified' : ''}`}
                                placeholder="Enter search query... (tip: use Beautify to fix typos!)"
                                value={query}
                                onChange={(e) => handleQueryChange(index, e.target.value)}
                                style={{
                                    transition: 'all 0.3s ease',
                                }}
                            />
                            {queries.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuery(index)}
                                    className="btn-remove"
                                    title="Remove query"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="button-container">
                        <button
                            type="button"
                            onClick={addQuery}
                            className="btn-primary"
                            style={{
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--border-glass)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span style={{ fontSize: '1.1rem' }}>+</span>
                            Add Query
                        </button>

                        <button
                            type="button"
                            onClick={handleBeautify}
                            disabled={beautifyLoading}
                            className={`btn-beautify ${beautifyLoading ? 'loading' : ''}`}
                        >
                            {beautifyLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        animation: 'sparkle 0.5s ease-in-out infinite'
                                    }}>✨</span>
                                    Beautifying...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>✨</span>
                                    Beautify Text
                                </span>
                            )}
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        display: 'inline-block',
                                        animation: 'pulse-glow 1s ease-in-out infinite'
                                    }}>🔍</span>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Perform Search
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{
                        color: '#ef4444',
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

                {results && (
                    <div style={{ marginTop: '2rem' }} className="animate-fade-in">
                        <h4 className="gradient-text" style={{ marginBottom: '0.75rem' }}>Results Summary</h4>
                        <p style={{
                            color: 'var(--text-muted)',
                            display: 'flex',
                            gap: '1rem'
                        }}>
                            <span style={{ color: '#22c55e' }}>✓ Successful: {results.summary.successful}</span>
                            <span style={{ color: results.summary.failed > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                                ✗ Failed: {results.summary.failed}
                            </span>
                        </p>

                        <div style={{ marginTop: '1.5rem' }}>
                            {results.results.map((result, idx) => (
                                <div
                                    key={idx}
                                    className="animate-fade-in"
                                    style={{
                                        marginBottom: '2rem',
                                        borderBottom: '1px solid var(--border-glass)',
                                        paddingBottom: '1.5rem',
                                        animationDelay: `${idx * 0.1}s`
                                    }}
                                >
                                    <h5 style={{
                                        color: 'var(--accent-brown)',
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <span>🔎</span>
                                        {result.query}
                                    </h5>
                                    {result.answer && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(139, 111, 71, 0.1), rgba(210, 180, 140, 0.1))',
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            margin: '1rem 0',
                                            border: '1px solid rgba(139, 111, 71, 0.2)'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.5rem',
                                                color: 'var(--accent-tan)'
                                            }}>
                                                <span>🤖</span>
                                                <strong>AI Answer</strong>
                                            </div>
                                            <p style={{ color: 'var(--text-main)' }}>{result.answer}</p>
                                        </div>
                                    )}
                                    {result.results.map((r, rIdx) => (
                                        <div
                                            key={rIdx}
                                            style={{
                                                margin: '0.75rem 0',
                                                padding: '0.75rem',
                                                borderRadius: '0.5rem',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <a
                                                href={r.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: 'var(--primary-color)',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <span>🔗</span>
                                                {r.title}
                                            </a>
                                            <p style={{
                                                fontSize: '0.9rem',
                                                color: 'var(--text-muted)',
                                                marginTop: '0.25rem'
                                            }}>
                                                {r.content.substring(0, 200)}...
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
