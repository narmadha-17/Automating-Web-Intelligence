import React from 'react';
import { Download, History } from 'lucide-react';

export function StatsPanel({ stats, history, onExport }) {
    return (
        <div className="card">
            <h2>
                <span>📊</span> Statistics
            </h2>
            <div className="stats-grid">
                <div className="stat-box">
                    <div className="stat-value">{stats.totalSearches}</div>
                    <div className="stat-label">Total Searches</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{stats.totalResults}</div>
                    <div className="stat-label">Results Found</div>
                </div>
                <div className="stat-box">
                    <div className="stat-value">{stats.successRate}%</div>
                    <div className="stat-label">Success Rate</div>
                </div>
            </div>

            <h3 style={{ color: '#333', marginTop: '25px', marginBottom: '15px' }}>
                <History size={20} style={{ display: 'inline', marginRight: '5px' }} />
                📜 Search History
            </h3>
            <div id="history-container" className="empty-state" style={{ minHeight: '150px' }}>
                {history.length === 0 ? (
                    <p>No searches yet</p>
                ) : (
                    history.map((item, idx) => (
                        <div key={idx} className="history-item">
                            <div className="history-time">{item.timestamp}</div>
                            <div className="history-info">
                                <strong>{item.queries.length}</strong> queries →{' '}
                                <strong>{item.count}</strong> results
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                className="btn-secondary"
                style={{ width: '100%', marginTop: '15px' }}
                onClick={onExport}
            >
                <Download size={18} /> Export All Results
            </button>
        </div>
    );
}
