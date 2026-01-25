import React from 'react';
import { ExternalLink, Copy } from 'lucide-react';

export function ResultsPanel({ results, onCopy }) {
    if (!results || results.length === 0) {
        return (
            <div className="card results-container">
                <h2>
                    <span>📋</span> Search Results
                </h2>
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>No results yet. Start a search to see results here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card results-container">
            <h2>
                <span>📋</span> Search Results
            </h2>
            {results.map((result, idx) => (
                <div key={idx} className="result-card">
                    <div className="result-header">
                        <div>
                            <div className="result-query">{result.query}</div>
                            <div style={{ marginTop: '8px' }}>
                                <span className="badge">Tavily API</span>
                                <span className="badge">{result.results?.length || 0} sources</span>
                            </div>
                        </div>
                        <button
                            className="copy-button"
                            onClick={() => onCopy(result)}
                            title="Copy result"
                        >
                            <Copy size={18} />
                        </button>
                    </div>

                    {result.answer && (
                        <div className="result-answer">
                            <strong>AI Answer:</strong>
                            <br />
                            {result.answer}
                        </div>
                    )}

                    <div className="result-items">
                        {(result.results || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="result-item">
                                <div className="result-item-title">{item.title}</div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="result-item-url"
                                >
                                    🔗 {item.url}
                                </a>
                                <div className="result-item-content">
                                    {item.content || 'No content available'}
                                </div>
                                <div className="result-item-score">
                                    Relevance: {(item.score * 100).toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
