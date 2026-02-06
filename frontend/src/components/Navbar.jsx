import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'search', label: 'Search' },
        { id: 'extract', label: 'Extract' },
        { id: 'crawl', label: 'Crawl' },
        { id: 'map', label: 'Map' }
    ];

    return (
        <nav className="glass-card" style={{
            margin: '1rem',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100
        }}>
            <h2 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>Web Intel</h2>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'color 0.2s',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
