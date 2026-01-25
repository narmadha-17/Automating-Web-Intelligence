# 🔍 Tavily Web Intelligence Automation

**Automated Web Scraping & Research Powered by AI**

A full-stack web application for automating web scraping using the Tavily API, with MongoDB for data persistence and a beautiful React-based frontend dashboard.

## 📋 Features

✨ **Core Features:**
- 🔍 Batch web search using Tavily API
- 🤖 AI-powered search results with answers
- 💾 MongoDB integration for result storage
- 📊 Real-time statistics and analytics
- 📥 Export results (JSON/CSV)
- 🎯 Search history tracking
- 🎨 Beautiful, responsive UI
- 📱 Mobile-friendly dashboard

## 🏗️ Project Structure

```
Automating-Web-Intelligence/
├── public/
│   └── index.html                 # Standalone HTML dashboard
├── src/
│   ├── automation.js              # CLI automation class
│   ├── server.js                  # Express.js backend server
│   ├── services/
│   │   └── tavily.js              # Tavily API service
│   ├── db/
│   │   └── mongodb.js             # MongoDB service
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── SearchPanel.jsx        # Search input component
│   │   ├── ResultsPanel.jsx       # Results display component
│   │   └── StatsPanel.jsx         # Statistics component
│   └── styles/
│       └── dashboard.css          # Styling
├── package.json
├── .env                           # Environment variables
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- MongoDB running locally or remote connection
- Tavily API key (get from https://tavily.com)

### Installation

1. **Clone or navigate to the project:**
```bash
cd Automating-Web-Intelligence
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
cp .env.example .env
```

4. **Configure `.env` with your settings:**
```env
# Tavily API
TAVILY_API_KEY=your_api_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=automating_web_intellegence
MONGODB_COLLECTION=automating_web_intellegence

# Server
PORT=5000
NODE_ENV=development

# Search Options
MAX_RESULTS=5
SEARCH_DEPTH=advanced
```

### Running the Application

**Option 1: Start the Web Server (Recommended)**
```bash
npm run server
# or
npm run dev
```

Then open your browser to:
```
http://localhost:5000
```

**Option 2: Run CLI Automation**
```bash
npm start
```

## 🌐 Web Interface

### Dashboard Features

#### Search Panel
- Enter multiple queries (one per line)
- Configure search depth (Basic/Advanced)
- Set max results per query (3-20)
- Real-time loading indicator
- Error handling and alerts

#### Statistics Panel
- Total searches counter
- Total results found
- Success rate percentage
- Search history with timestamps
- Export all results button

#### Results Panel
- Query-based result grouping
- AI-generated answers
- Source URLs with direct links
- Content snippets
- Relevance scoring (0-100%)
- Copy to clipboard functionality
- Badges for result source and count

## 📡 API Endpoints

### Search
```http
POST /api/search
Content-Type: application/json

{
  "queries": ["AI developments", "Web scraping"],
  "searchDepth": "advanced",
  "maxResults": 5
}

Response:
{
  "success": true,
  "results": [...],
  "errors": [],
  "summary": {
    "totalQueries": 2,
    "successfulSearches": 2,
    "failedSearches": 0,
    "totalResultsFound": 10
  }
}
```

### Get Stored Results
```http
GET /api/results?limit=10
```

### Get Statistics
```http
GET /api/stats
```

### Export Results
```http
GET /api/export?format=json&limit=100
GET /api/export?format=csv&limit=100
```

### Batch Search
```http
POST /api/batch-search
(Same payload as /api/search)
```

### Search History
```http
GET /api/history?limit=20
```

### Health Check
```http
GET /api/health
```

## 💾 MongoDB Schema

### Search Results Collection
```javascript
{
  _id: ObjectId,
  query: String,
  answer: String,
  results: [
    {
      title: String,
      url: String,
      content: String,
      score: Number
    }
  ],
  timestamp: Date
}
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TAVILY_API_KEY` | Your Tavily API key | Required |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DATABASE` | Database name | `automating_web_intellegence` |
| `MONGODB_COLLECTION` | Collection name | `automating_web_intellegence` |
| `PORT` | Server port | `5000` |
| `MAX_RESULTS` | Default max results per query | `5` |
| `SEARCH_DEPTH` | Default search depth | `advanced` |
| `NODE_ENV` | Environment (development/production) | `development` |

## 📊 Usage Examples

### Using the Web Dashboard
1. Open http://localhost:5000 in your browser
2. Enter search queries (one per line)
3. Configure search options
4. Click "Start Search"
5. View results in real-time
6. Export results as needed

### Using the API
```bash
# Search
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "queries": ["Latest AI news"],
    "searchDepth": "advanced",
    "maxResults": 5
  }'

# Export results
curl http://localhost:5000/api/export?format=json > results.json

# View stats
curl http://localhost:5000/api/stats
```

### Using CLI Automation
```javascript
import WebScrapingAutomation from './src/automation.js';

const automation = new WebScrapingAutomation();

const results = await automation.runWithQueries(
  ['Query 1', 'Query 2'],
  {
    export: true,
    exportFormat: 'json',
    searchDepth: 'advanced',
    maxResults: 5
  }
);
```

## 🎨 UI Components

### SearchPanel.jsx
Handles user input for search queries and options.

**Props:**
- `onSearch` - Callback function when search is submitted
- `isLoading` - Boolean for loading state

### ResultsPanel.jsx
Displays search results with formatting.

**Props:**
- `results` - Array of search results
- `onCopy` - Callback for copy action

### StatsPanel.jsx
Shows statistics and search history.

**Props:**
- `stats` - Statistics object
- `history` - Search history array
- `onExport` - Callback for export action

## 🛠️ Development

### Install Dev Dependencies
```bash
npm install --save-dev @vitejs/plugin-react vite
```

### Run in Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📚 Technologies Used

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- Axios (HTTP client)
- dotenv (Environment variables)

**Frontend:**
- React 18
- Lucide Icons
- CSS3 (Animations, Grid, Flexbox)
- Vanilla JavaScript

**APIs:**
- Tavily Search API
- RESTful API design

## 🔒 Security

- API keys stored in `.env` (not committed)
- Input validation on all endpoints
- Error handling without sensitive info exposure
- CORS ready for expansion

## 📈 Performance Features

- Batch search processing
- Connection pooling with MongoDB
- Result caching capability
- Efficient pagination support
- Request timeout handling (30s)

## 🐛 Troubleshooting

### TAVILY_API_KEY not found
**Solution:** Set the API key in your `.env` file:
```env
TAVILY_API_KEY=your_key_here
```

### MongoDB Connection Failed
**Solution:** Ensure MongoDB is running:
```bash
mongod  # on macOS/Linux
# or start MongoDB service on Windows
```

### Port Already in Use
**Solution:** Change the PORT in `.env` or kill the process using port 5000:
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### CORS Issues
**Solution:** The server includes CORS headers. Configure origin in `server.js` if needed.

## 📝 License

ISC

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check MongoDB logs
4. Review Tavily API documentation

---

**Made with ❤️ using Tavily AI Search**
