import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const Map = () => {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleMap = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/map/`, {
                url: url.trim(),
                include_images: false
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
        <div className="glass-card animate-scale-in hover-glow" style={{ maxWidth: '800px', margin: '2rem auto' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Site Mapper</h3>
            <form onSubmit={handleMap}>
                <input
                    className="input-glass"
                    placeholder="URL to map..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Mapping...' : 'Generate Map'}
                </button>
            </form>

            {error && <div style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</div>}

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <h4 className="gradient-text">Site Map</h4>
                    <div style={{ marginTop: '1.5rem' }}>
                        {results.results && results.results.map((link, idx) => (
                            <div key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
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
