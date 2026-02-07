import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Extract = ({ apiKey }) => {
    const [urls, setUrls] = useState(['']);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [beautifyLoading, setBeautifyLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleUrlChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrl = () => setUrls([...urls, '']);

    const handleBeautify = async () => {
        if (!query.trim()) {
            setError('Please enter a question to beautify');
            return;
        }

        setBeautifyLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/beautify/correct`, {
                queries: [query]
            });
            const corrected = response.data.corrected_queries[0];

            if (corrected !== query) {
                setQuery(corrected);
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

    const handleExtract = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/extract/`, {
                urls: urls.filter(u => u.trim() !== ''),
                query: query.trim() || undefined,
                extract_depth: 'advanced',
                include_images: false,
                include_answer: true,
                api_key: apiKey
            });
            setResults(response.data);
        } catch (err) {
            console.error('Extraction error:', err);
            const detail = err.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') :
                    (detail ? JSON.stringify(detail) : err.message));
            setError(errorMsg || 'An error occurred during extraction');
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

                <h3 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Content Extraction</h3>

                <form onSubmit={handleExtract}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Specific Question (Optional)
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="glass-input"
                                placeholder="e.g. 'What is the pricing?'"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleBeautify}
                                disabled={beautifyLoading || !query.trim()}
                                className="btn btn-magic"
                                style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Beautify Question"
                            >
                                {beautifyLoading ? '✨' : '✨'}
                            </button>
                        </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Target URLs
                    </label>
                    {urls.map((url, index) => (
                        <div key={index} style={{ marginBottom: '0.75rem' }}>
                            <input
                                className="glass-input"
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => handleUrlChange(index, e.target.value)}
                            />
                        </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                        <button type="button" onClick={addUrl} className="btn btn-ghost" style={{ border: '1px solid var(--border-glass)' }}>
                            + Add URL
                        </button>

                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                            {loading ? 'Extracting...' : 'Extract Content'}
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
                    {results.answer && (
                        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
                            <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>AI Summary</h4>
                            <p style={{ lineHeight: '1.6' }}>{results.answer}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 className="text-gradient">Extracted Data</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Success: <span style={{ color: '#10B981' }}>{results.summary.successful}</span>
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {results.results.map((result, idx) => (
                            <div key={idx} className="result-card animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <h5 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', wordBreak: 'break-all' }}>
                                    {result.url}
                                </h5>
                                <div style={{
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontFamily: 'var(--font-mono)',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    color: 'var(--text-muted)'
                                }}>
                                    {result.content || result.raw_content || 'No content found'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Extract;
