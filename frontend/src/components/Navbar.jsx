import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'search', label: 'Search' },
        { id: 'extract', label: 'Extract' },
        { id: 'crawl', label: 'Crawl' },
        { id: 'map', label: 'Map' }
    ];

    return (
        <nav className="glass-panel" style={{
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        }}>
            <h2 className="text-gradient" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>
                Web Intel
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-full)' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-ghost'}
                        style={{
                            borderRadius: 'calc(var(--radius-full) - 2px)',
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.9rem'
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
