#!/bin/bash

# ========================================
# Tavily Web Intelligence - Quick Start
# ========================================

echo ""
echo "🚀 Starting Tavily Web Intelligence..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your TAVILY_API_KEY"
    echo "📝 Then run this script again."
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Check MongoDB
echo "🗄️  Checking MongoDB..."
pgrep -x mongod > /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  MongoDB not running. Please start MongoDB:"
    echo "   mongod  (or your installation method)"
    echo ""
    read -p "Press enter when MongoDB is running..."
fi

# Start the server
echo ""
echo "🌐 Starting Web Server on http://localhost:5000..."
echo ""

# Open browser (macOS)
if command -v open &> /dev/null; then
    sleep 2
    open http://localhost:5000
fi

# Open browser (Linux)
if command -v xdg-open &> /dev/null; then
    sleep 2
    xdg-open http://localhost:5000
fi

npm run server
