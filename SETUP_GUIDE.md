# 🚀 Frontend Setup Guide

## Complete Frontend & Backend Integration

This guide will walk you through setting up the entire Tavily Web Intelligence application with both frontend and backend.

## 📦 Project Structure

```
Automating-Web-Intelligence/
├── public/
│   └── index.html                 # Standalone HTML (no dependencies)
├── src/
│   ├── automation.js              # CLI tool (Node.js)
│   ├── server.js                  # Express backend server
│   ├── main.jsx                   # React entry point
│   ├── services/
│   │   └── tavily.js              # Tavily API wrapper
│   ├── db/
│   │   └── mongodb.js             # MongoDB service
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── SearchPanel.jsx
│   │   ├── ResultsPanel.jsx
│   │   └── StatsPanel.jsx
│   └── styles/
│       └── dashboard.css
├── .env.example                   # Environment template
├── vite.config.js                 # Vite configuration
├── index.html                     # React app HTML
├── package.json
└── FRONTEND_README.md             # Full documentation
```

## ⚙️ Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your credentials
notepad .env  # Windows
# or
nano .env     # macOS/Linux
```

**Required Configuration:**
```env
TAVILY_API_KEY=your_actual_key_here
MONGODB_URI=mongodb://localhost:27017
PORT=5000
```

### Step 3: Start MongoDB
```bash
# Windows
net start MongoDB

# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### Step 4: Verify MongoDB Connection
```bash
# Test connection
mongosh --eval "db.version()"
```

## 🌐 Three Ways to Use the Application

### Option A: Standalone HTML Dashboard (Recommended for Quick Start)

No build tools needed! Pure HTML + CSS + JavaScript.

```bash
# Just start the server
npm run server

# Open browser to:
http://localhost:5000
```

**Pros:**
- ✅ No build process
- ✅ Works immediately
- ✅ All features included
- ✅ File size is small

**Location:** `/public/index.html`

---

### Option B: React SPA (Recommended for Development)

Full React component architecture with Vite.

```bash
# Install dev dependencies (if not already done)
npm install --save-dev @vitejs/plugin-react vite

# Start development server
npm run dev

# In another terminal, start Express backend
npm run server
```

**Pros:**
- ✅ React component structure
- ✅ Hot module reloading
- ✅ Better for scaling
- ✅ Component reusability

**Access:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/*`

**Components:**
- `src/components/Dashboard.jsx` - Main component
- `src/components/SearchPanel.jsx` - Search input
- `src/components/ResultsPanel.jsx` - Results display
- `src/components/StatsPanel.jsx` - Statistics

---

### Option C: CLI Automation (Command Line)

Traditional Node.js script execution.

```bash
npm start
```

**Configuration:** Edit hardcoded values in `src/automation.js`

---

## 📚 Feature Comparison

| Feature | HTML | React | CLI |
|---------|------|-------|-----|
| Web UI | ✅ | ✅ | ❌ |
| API Server | ✅ | ✅ | ❌ |
| Components | ❌ | ✅ | ❌ |
| Hot Reload | ❌ | ✅ | ❌ |
| Database | ✅ | ✅ | ✅ |
| Export | ✅ | ✅ | ✅ |
| Batch Search | ✅ | ✅ | ✅ |

## 🎯 Quick Start (5 Minutes)

### Fastest Way to Get Running

1. **Install & Configure**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with TAVILY_API_KEY
   ```

2. **Start MongoDB**
   ```bash
   mongosh  # or your MongoDB start command
   ```

3. **Start Server**
   ```bash
   npm run server
   ```

4. **Open Browser**
   ```
   http://localhost:5000
   ```

Done! 🎉

## 🔌 API Reference

### Base URL
```
http://localhost:5000
```

### Endpoints

#### Search
```javascript
// POST /api/search
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    queries: ['AI trends', 'Web scraping'],
    searchDepth: 'advanced',
    maxResults: 5
  })
});
const data = await response.json();
```

#### Get Results
```javascript
// GET /api/results?limit=10
fetch('/api/results?limit=10')
  .then(r => r.json())
  .then(data => console.log(data.results));
```

#### Export Results
```javascript
// GET /api/export?format=json
window.location.href = '/api/export?format=json';

// Or CSV
window.location.href = '/api/export?format=csv';
```

#### Statistics
```javascript
// GET /api/stats
fetch('/api/stats')
  .then(r => r.json())
  .then(data => console.log(data.stats));
```

## 🎨 UI Screenshots & Features

### Dashboard Layout
```
┌─────────────────────────────────────────┐
│  🔍 Tavily Web Intelligence             │
│  Automated Web Scraping & Research      │
└─────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  🚀 Search       │  │  📊 Statistics   │
│  - Queries       │  │  - Total Search  │
│  - Depth         │  │  - Results Found │
│  - Max Results   │  │  - Success Rate  │
│  [Start Search]  │  │  - History       │
└──────────────────┘  └──────────────────┘

┌─────────────────────────────────────────┐
│  📋 Search Results                      │
│  - Query & AI Answer                    │
│  - Source Links                         │
│  - Content Snippets                     │
│  - Relevance Scores                     │
└─────────────────────────────────────────┘
```

### Key Features

**Search Panel:**
- ✅ Multi-line query input
- ✅ Search depth selector
- ✅ Max results selector
- ✅ Real-time validation
- ✅ Loading indicators

**Statistics Panel:**
- ✅ Live counters
- ✅ Search history
- ✅ Timestamp tracking
- ✅ Export button

**Results Panel:**
- ✅ Formatted results
- ✅ Direct links
- ✅ Relevance scores
- ✅ Copy to clipboard
- ✅ Multiple sources per query

## 🛠️ Development Workflow

### Making Changes

**To HTML Dashboard:**
Edit `/public/index.html` → Refresh browser

**To React Components:**
```bash
# Terminal 1
npm run server

# Terminal 2
npm run dev
```
Edit files → Auto-reload at localhost:3000

**To Express Backend:**
Edit `src/server.js` → Restart server

**To Services:**
Edit `src/services/tavily.js` → Restart server

### File Watching (Optional)

```bash
npm install --save-dev nodemon

# Then edit package.json script:
"server": "nodemon src/server.js"

npm run server
```

## 🔍 Testing the Application

### Test 1: Basic Search
1. Open http://localhost:5000
2. Enter: "What is machine learning?"
3. Click "Start Search"
4. Check results display correctly

### Test 2: Multiple Queries
1. Enter multiple queries (one per line)
2. Set search depth to "Advanced"
3. Set max results to 10
4. Observe results aggregation

### Test 3: Export Functionality
1. Perform a search
2. Click "Export All Results"
3. Verify JSON file downloads

### Test 4: Database Persistence
1. Search for something
2. Close browser/application
3. Restart and check `/api/results`
4. Verify old results still exist

## 📊 MongoDB Data Structure

Results are stored in this format:

```javascript
{
  "_id": ObjectId("..."),
  "query": "machine learning",
  "answer": "Machine learning is...",
  "results": [
    {
      "title": "Result Title",
      "url": "https://...",
      "content": "Result content...",
      "score": 0.95
    }
  ],
  "timestamp": "2024-01-25T10:30:00Z"
}
```

**Query Data:**
```bash
# Connect to MongoDB
mongosh

# Switch database
use automating_web_intellegence

# View results
db.automating_web_intellegence.find()

# Count documents
db.automating_web_intellegence.countDocuments()

# Export to JSON
db.automating_web_intellegence.find().toArray()
```

## 🐛 Common Issues & Solutions

### Issue: "TAVILY_API_KEY not found"
```bash
# Solution: Check .env file
cat .env | grep TAVILY_API_KEY

# Should see:
TAVILY_API_KEY=tvly-...
```

### Issue: MongoDB connection refused
```bash
# Check if MongoDB is running
mongosh

# If not:
mongod  # or use your installation method
```

### Issue: Port 5000 already in use
```bash
# Find process using port
lsof -i :5000

# Kill it
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### Issue: React app not loading
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Start both servers
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

## 📈 Performance Tips

1. **Batch Searches:** Search multiple queries at once instead of one-by-one
2. **Limit Results:** Reduce `maxResults` for faster responses
3. **Use Basic Search:** Use "Basic" search depth for faster results
4. **Index MongoDB:** Add indexes on `query` field for faster lookups

## 🔒 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables (Production)
```env
NODE_ENV=production
TAVILY_API_KEY=your_production_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
PORT=3000
```

### Run Production Server
```bash
npm run server --production
```

## 📚 Additional Resources

- **Tavily API Docs:** https://api.tavily.com/docs
- **Express.js:** https://expressjs.com
- **React:** https://react.dev
- **MongoDB:** https://www.mongodb.com/docs
- **Vite:** https://vitejs.dev

## ✨ Next Steps

1. ✅ Configure `.env` file
2. ✅ Start MongoDB
3. ✅ Run `npm run server`
4. ✅ Open http://localhost:5000
5. ✅ Start searching!

## 🎓 Learning Resources

### Code Structure
- `server.js` - Learn Express routing
- `services/tavily.js` - Learn API integration
- `db/mongodb.js` - Learn database patterns
- `components/*.jsx` - Learn React components
- `public/index.html` - Learn vanilla JS UI

### Try These Experiments

1. Add authentication to the API
2. Implement result filtering
3. Add user accounts with saved searches
4. Create custom search templates
5. Add advanced analytics dashboard

---

**Happy Searching! 🚀**

Questions? Check `FRONTEND_README.md` for more details.
