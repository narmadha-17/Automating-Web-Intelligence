import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Map = ({ apiKey }) => {
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

    const handleMap = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/map/`, {
                url: url.trim(),
                instructions: instructions.trim() || undefined,
                max_depth: 1,
                max_breadth: 10,
                limit: 5,
                api_key: apiKey
            });
            setResults(response.data);
        } catch (err) {
            console.error('Mapping error:', err);
            const detail = err.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail :
                (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') :
                    (detail ? JSON.stringify(detail) : err.message));
            setError(errorMsg || 'An error occurred during mapping');
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

                <h3 className="text-gradient" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Site Mapper</h3>

                <form onSubmit={handleMap}>
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
                            Mapping Instructions
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <textarea
                                className="glass-input"
                                placeholder="e.g. 'Only find blog posts'"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                rows={2}
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
                        {loading ? 'Mapping...' : 'Generate Map'}
                    </button>
                </form>

                {error && <div style={{ color: '#EF4444', marginTop: '1rem', padding: '0.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)' }}>⚠️ {error}</div>}
            </div>

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 className="text-gradient" style={{ marginBottom: '1rem' }}>Site Map</h4>
                    <div className="glass-panel" style={{ padding: '1rem' }}>
                        {results.results && results.results.map((link, idx) => (
                            <div key={idx} style={{ padding: '0.75rem 0', borderBottom: idx < results.results.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontSize: '0.95rem' }} onMouseEnter={(e) => e.target.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                                    {link}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Map;
