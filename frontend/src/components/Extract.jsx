import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Extract = ({ apiKey }) => {
    const [urls, setUrls] = useState(['']);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleUrlChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrl = () => setUrls([...urls, '']);

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
        <div className="glass-card animate-scale-in hover-glow" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Content Extraction</h3>
            <form onSubmit={handleExtract}>
                <input
                    className="input-glass"
                    placeholder="Extraction Query (optional, e.g. 'What is the pricing?')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {urls.map((url, index) => (
                    <input
                        key={index}
                        className="input-glass"
                        placeholder="Enter URL to extract..."
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                    />
                ))}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button type="button" onClick={addUrl} className="btn-primary" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-glass)' }}>
                        + Add URL
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Extracting...' : 'Extract Content'}
                    </button>
                </div>
            </form>

            {error && (
                <div style={{
                    color: '#ef4444',
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    {results.answer && (
                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid var(--accent-blue)' }}>
                            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>AI Summary</h4>
                            <p>{results.answer}</p>
                        </div>
                    )}

                    <h4 className="gradient-text">Extracted Data</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Total: {results.summary.total} | Successful: {results.summary.successful}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {results.results.map((result, idx) => (
                            <div key={idx} className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                <h5 style={{ color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>{result.url}</h5>
                                <div style={{ fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                                    {result.content || result.raw_content ?
                                        (result.content || result.raw_content).substring(0, 1000) + '...' :
                                        'No content extracted'}
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
