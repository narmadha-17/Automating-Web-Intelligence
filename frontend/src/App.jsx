import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Search from './components/Search';
import Extract from './components/Extract';
import Crawl from './components/Crawl';
import Map from './components/Map';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  const renderContent = () => {
    switch (activeTab) {
      case 'search': return <Search />;
      case 'extract': return <Extract />;
      case 'crawl': return <Crawl />;
      case 'map': return <Map />;
      default: return <Search />;
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
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            AI-powered gathering and extraction from the web.
          </p>
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
