import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Crawl = ({ apiKey }) => {
    const [url, setUrl] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleCrawl = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/crawl/`, {
                url: url.trim(),
                instructions: instructions.trim() || undefined,
                max_depth: 1,
                max_breadth: 10,
                limit: 5,
                api_key: apiKey
            });
            setResults(response.data);
        } catch (err) {
            console.error('Crawl error:', err);
            const detail = err.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') :
                    (detail ? JSON.stringify(detail) : err.message));
            setError(errorMsg || 'An error occurred during crawl');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card animate-scale-in hover-glow" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Website Crawler</h3>
            <form onSubmit={handleCrawl}>
                <input
                    className="input-glass"
                    placeholder="Base URL to crawl..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <textarea
                    className="input-glass"
                    placeholder="Crawl Instructions (e.g. 'Look for contact information and pricing')"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical' }}
                />
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Crawling...' : 'Start Crawl'}
                </button>
            </form>

            {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</div>}

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 className="gradient-text">Crawl Results</h4>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {results.results && results.results.map((res, idx) => (
                            <div key={idx} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-brown)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem' }}>
                                    {res.url}
                                </a>
                                <p style={{ fontSize: '0.9rem' }}>
                                    {res.content || res.raw_content ?
                                        (res.content || res.raw_content).substring(0, 300) + '...' :
                                        'No content'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Crawl;
