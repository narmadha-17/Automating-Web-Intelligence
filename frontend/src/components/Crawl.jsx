import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Crawl = ({ apiKey }) => {
    const [url, setUrl] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);
    const [beautifyLoading, setBeautifyLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleBeautify = async () => {
        if (!instructions.trim()) {
            setError('Please enter instructions to beautify');
            return;
        }

        setBeautifyLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/beautify/correct`, {
                queries: [instructions]
            });
            const corrected = response.data.corrected_queries[0];

            if (corrected !== instructions) {
                setInstructions(corrected);
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

                <h3 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Website Crawler</h3>

                <form onSubmit={handleCrawl}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Target URL
                        </label>
                        <input
                            className="glass-input"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Crawl Instructions
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <textarea
                                className="glass-input"
                                placeholder="e.g. 'Look for contact information and pricing'"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={3}
                                style={{ resize: 'vertical', flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleBeautify}
                                disabled={beautifyLoading || !instructions.trim()}
                                className="btn btn-magic"
                                style={{ padding: '0 1rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Beautify Instructions"
                            >
                                {beautifyLoading ? '✨' : '✨'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                        {loading ? 'Crawling...' : 'Start Crawl'}
                    </button>
                </form>

                {error && <div style={{ color: '#EF4444', marginTop: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)' }}>⚠️ {error}</div>}
            </div>

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 className="text-gradient" style={{ marginBottom: '1rem' }}>Crawl Results</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {results.results && results.results.map((res, idx) => (
                            <div key={idx} className="result-card animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    {res.url}
                                </a>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
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
