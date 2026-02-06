import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Search from './components/Search';
import Extract from './components/Extract';
import Crawl from './components/Crawl';
import Map from './components/Map';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tavily_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    localStorage.setItem('tavily_api_key', apiKey);
  }, [apiKey]);

  const renderContent = () => {
    const props = { apiKey, activeTab };
    switch (activeTab) {
      case 'search': return <Search {...props} />;
      case 'extract': return <Extract {...props} />;
      case 'crawl': return <Crawl {...props} />;
      case 'map': return <Map {...props} />;
      default: return <Search {...props} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ padding: '0 1rem' }} className="animate-fade-in">
        <div className="glass-card animate-scale-in hover-glow" style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }} className="gradient-text">
            Web Intelligence Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            AI-powered gathering and extraction from the web.
          </p>

          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '1rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '0.8rem',
            border: '1px solid var(--border-glass)'
          }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Tavily API Key (saved locally)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showApiKey ? "text" : "password"}
                className="input-glass"
                placeholder="Enter tvly-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ marginBottom: 0, textAlign: 'center', paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  fontSize: '1.2rem',
                  color: 'var(--text-muted)',
                  transition: 'color 0.2s ease, transform 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary-color)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        </div>

        {renderContent()}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        marginTop: 'auto'
      }}>
        Built with Passion - Narmadha Ganesan
      </footer>
    </div>
  );
}

export default App;
