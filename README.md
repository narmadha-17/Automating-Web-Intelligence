# Tavily Web Scraping Automation with MongoDB

Automated web intelligence gathering using Tavily's AI-powered search API with MongoDB storage for persistent data management.

## 🚀 Features

- **Tavily API Integration** - Leverage AI-powered web search with deep research capabilities
- **MongoDB Storage** - Automatic storage of all search results with timestamps
- **Batch Processing** - Process multiple queries in one run
- **Export Capabilities** - Export results to JSON or CSV format
- **Error Handling** - Robust error handling with detailed logging
- **Rate Limiting** - Built-in delay to respect API rate limits
- **Statistics** - Track search history and database statistics

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- Tavily API key (get one free at [tavily.com](https://tavily.com))

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API key:

```bash
copy .env.example .env
```

Edit `.env` and add your Tavily API key:

```env
TAVILY_API_KEY=tvly-your-actual-api-key-here
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=automating_web_intellegence
MONGODB_COLLECTION=automating_web_intellegence
```

### 3. Get Your Tavily API Key

1. Visit [https://tavily.com](https://tavily.com)
2. Sign up for a free account
3. Navigate to your dashboard
4. Copy your API key
5. Paste it into your `.env` file

### 4. Ensure MongoDB is Running

Make sure MongoDB is running on your system:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

If not running, start MongoDB service.

## 📖 Usage

### Basic Usage

Run the automation with sample queries:

```bash
npm start
```

This will:
1. Connect to MongoDB
2. Search 4 sample queries using Tavily API
3. Store results in MongoDB
4. Export results to JSON
5. Display summary statistics

### Custom Queries

Edit `src/automation.js` and modify the `sampleQueries` array:

```javascript
const sampleQueries = [
  'Your custom query 1',
  'Your custom query 2',
  'Your custom query 3'
];
```

### Using a Queries File

Create a `queries.txt` file with one query per line:

```text
Latest AI developments
Web scraping techniques
MongoDB optimization tips
```

Then modify `src/automation.js` to use the file:

```javascript
// Uncomment this line in the main() function
await automation.runWithFile('./queries.txt', { export: true });
```

### View Stored Results

```javascript
const automation = new WebScrapingAutomation();
await automation.viewStoredResults(10); // View last 10 results
```

### Get Database Statistics

```javascript
const automation = new WebScrapingAutomation();
await automation.getStats();
```

## 🗂️ Project Structure

```
Automating-Web-Intelligence/
├── src/
│   ├── db/
│   │   └── mongodb.js          # MongoDB connection and operations
│   ├── services/
│   │   └── tavily.js           # Tavily API integration
│   └── automation.js           # Main automation orchestrator
├── exports/                    # Exported results (auto-created)
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Environment template
├── package.json                # Project dependencies
└── README.md                   # This file
```

## 📊 MongoDB Schema

Each search result is stored with the following structure:

```javascript
{
  _id: ObjectId,
  query: String,
  answer: String,              // AI-generated answer
  results: [                   // Array of search results
    {
      title: String,
      url: String,
      content: String,
      score: Number,
      publishedDate: Date
    }
  ],
  images: Array,
  followUpQuestions: Array,
  searchMetadata: {
    searchDepth: String,
    resultCount: Number,
    searchedAt: ISODate
  },
  timestamp: ISODate,
  _metadata: {
    insertedAt: ISODate,
    source: "tavily-automation"
  }
}
```

## 🔍 API Options

Customize your searches with these options:

```javascript
await automation.runWithQueries(queries, {
  searchDepth: 'advanced',     // 'basic' or 'advanced'
  maxResults: 5,               // Number of results per query
  export: true,                // Export results to file
  exportFormat: 'json',        // 'json' or 'csv'
  includeImages: true,         // Include images in results
  includeRawContent: false     // Include raw HTML content
});
```

## 🛠️ MongoDB Operations

The MongoDB service provides these methods:

- `insertSearchResult(result)` - Insert single result
- `insertBatchResults(results)` - Insert multiple results
- `findByQuery(query)` - Search stored results
- `getAllResults(limit)` - Get recent results
- `getStats()` - Get database statistics
- `clearAll()` - Delete all results

## 📦 Export Formats

### JSON Export
```json
[
  {
    "query": "AI developments",
    "answer": "...",
    "results": [...]
  }
]
```

### CSV Export
```csv
Query,Answer,Title,URL,Content,Score
"AI developments","...","Title 1","https://...","Content",0.95
```

## 🔐 Security

- Never commit your `.env` file to version control
- Keep your Tavily API key private
- Use environment variables for sensitive data

## 🐛 Troubleshooting

### "Invalid Tavily API key"
- Make sure you've set `TAVILY_API_KEY` in your `.env` file
- Verify the key is correct from your Tavily dashboard
- Ensure there are no extra spaces or quotes around the key

### "MongoDB connection error"
- Check if MongoDB is running: `mongosh --eval "db.version()"`
- Verify connection string in `.env` file
- Ensure MongoDB is accessible on port 27017

### "Rate limit exceeded"
- Wait a few minutes before retrying
- Consider upgrading your Tavily plan for higher limits
- Increase delay between requests in `tavily.js`

## 📚 Resources

- [Tavily API Documentation](https://docs.tavily.com)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for MongoDB

## 📝 License

ISC

## 🤝 Contributing

Feel free to open issues or submit pull requests!

---

**Made with ❤️ using Tavily API and MongoDB**
