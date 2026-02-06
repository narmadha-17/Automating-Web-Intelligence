import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Search from './components/Search';
import Extract from './components/Extract';
import Crawl from './components/Crawl';
import Map from './components/Map';
import bearOpen from './assets/bear-eyes-open.png';
import bearClosed from './assets/bear-eyes-closed.png';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('tavily_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
        <div className="search-container" style={{ maxWidth: '800px', margin: '2rem auto', position: 'relative' }}>
          <div className="search-bg-mesh"></div>
          <div className="search-bg-aurora"></div>

          <div className="search-orb search-orb-1"></div>
          <div className="search-orb search-orb-2"></div>
          <div className="search-orb search-orb-3"></div>

          <div className="search-particles">
            <div className="search-particle"></div>
            <div className="search-particle"></div>
            <div className="search-particle"></div>
            <div className="search-particle"></div>
            <div className="search-particle"></div>
            <div className="search-particle"></div>
          </div>

          <div className="search-bg-grid"></div>
          <div className="search-bg-noise"></div>

          <div className="glass-card animate-scale-in hover-glow" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }} className="gradient-text">
              Web Intelligence Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
              AI-powered gathering and extraction from the web.
            </p>

            <div style={{
              maxWidth: '500px',
              margin: '2rem auto 0 auto',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '1rem',
              border: '1px solid var(--border-glass)',
              position: 'relative'
            }}>
              {/* Cute Bear Character */}
              <div style={{
                position: 'absolute',
                top: '-120px',
                left: '50%',
                transform: 'translateX(-50%)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 10,
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#FDF5E6',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                border: '4px solid rgba(255,255,255,0.1)'
              }}>
                <img
                  src={isPasswordFocused ? bearClosed : bearOpen}
                  alt="Bear"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '1rem' }}>
                Tavily API Key (saved locally)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  className="input-glass"
                  placeholder="Enter tvly-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
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
