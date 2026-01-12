import { useState } from 'react';
import { Search, Loader2, AlertCircle, ExternalLink, Download, History, Copy, Check } from 'lucide-react';

export default function TavilyAutomation() {
  const [queries, setQueries] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Simulated Tavily search function (for demonstration)
  const simulateSearch = async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      query: query,
      answer: `This is a simulated AI-generated answer for: "${query}". In a real implementation, this would be powered by Tavily's API which provides comprehensive, AI-curated search results.`,
      results: [
        {
          title: `Result 1 for ${query}`,
          url: `https://example.com/result1`,
          content: `This is a simulated search result content for ${query}. Tavily's API would return actual web search results with relevant content snippets.`,
          score: 0.95
        },
        {
          title: `Result 2 for ${query}`,
          url: `https://example.com/result2`,
          content: `Another simulated result showing how Tavily aggregates information from multiple sources to provide comprehensive answers.`,
          score: 0.88
        },
        {
          title: `Result 3 for ${query}`,
          url: `https://example.com/result3`,
          content: `Tavily specializes in research-grade search results that are filtered for quality and relevance.`,
          score: 0.82
        }
      ]
    };
  };

  const performSearch = async () => {
    const queryList = queries.split('\n').filter(q => q.trim());
    
    if (queryList.length === 0) {
      setError('Please enter at least one search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const searchResults = [];
      
      for (const query of queryList) {
        const result = await simulateSearch(query.trim());
        searchResults.push(result);
      }

      setResults(searchResults);
      setSearchHistory(prev => [
        ...prev,
        {
          timestamp: new Date().toLocaleString(),
          queries: queryList,
          count: searchResults.length
        }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tavily_results_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    const code = `# Tavily Python Implementation
import requests

def tavily_search(api_key, query):
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": 5,
        "include_answer": True
    }
    response = requests.post(url, json=payload)
    return response.json()

# Usage
api_key = "your_api_key_here"
result = tavily_search(api_key, "your query")
print(result)`;
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Tavily Search Automation</h1>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Python Code'}
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📘 Demo Mode</h3>
            <p className="text-sm text-blue-800">
              This is a demonstration interface. For actual Tavily API implementation, use the Python code (click "Copy Python Code" above) 
              with your API key from <a href="https://tavily.com" target="_blank" rel="noopener noreferrer" className="underline">tavily.com</a>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Queries (one per line)
              </label>
              <textarea
                value={queries}
                onChange={(e) => setQueries(e.target.value)}
                placeholder="Latest AI developments&#10;Python automation tutorials&#10;Web scraping best practices"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <button
              onClick={performSearch}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Run Automation
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Results ({results.length} {results.length === 1 ? 'query' : 'queries'})
              </h2>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>

            {results.map((result, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-indigo-600 mb-4">
                  Query: {result.query}
                </h3>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-900 mb-2">🤖 AI Answer</h4>
                  <p className="text-green-800">{result.answer}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">Search Results:</h4>
                  {result.results.map((item, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-2"
                      >
                        {item.title}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <p className="text-xs text-gray-500 mb-2">{item.url}</p>
                      <p className="text-gray-700 text-sm">{item.content}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                          Relevance: {(item.score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Search History</h3>
            </div>
            <div className="space-y-2">
              {searchHistory.map((entry, idx) => (
                <div key={idx} className="text-sm text-gray-600 border-l-2 border-indigo-300 pl-3">
                  {entry.timestamp} - {entry.count} {entry.count === 1 ? 'query' : 'queries'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
