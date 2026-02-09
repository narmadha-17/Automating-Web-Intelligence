import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Search from './components/Search';
import Extract from './components/Extract';
import Crawl from './components/Crawl';
import Map from './components/Map';
import Dashboard from './components/Dashboard';
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
      case 'dashboard': return <Dashboard />;
      default: return <Search {...props} />;
    }
  };

  return (
    <div className="app-layout">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      <header className="app-header">
        <div className="container">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </header>

      <main className="app-main container animate-slide-up">

        {/* Bear API Widget */}
        <div className="api-key-widget glass-panel">
          <div className="bear-avatar">
            <img
              src={isPasswordFocused ? bearClosed : bearOpen}
              alt="Bear Assistant"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h2 className="text-gradient" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
            Web Intelligence
          </h2>

          <div style={{ position: 'relative' }}>
            <input
              type={showApiKey ? "text" : "password"}
              className="glass-input"
              placeholder="Enter Tavily API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              style={{ paddingRight: '3rem', textAlign: 'center' }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="btn-ghost"
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.4rem',
              }}
              title={showApiKey ? "Hide Key" : "Show Key"}
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Your key is saved locally
          </p>
        </div>

        {/* Content Area */}
        <div className="search-wrapper">
          {renderContent()}
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Built with Passion & AI - Narmadha Ganesan
      </footer>
    </div>
  );
}

export default App;
