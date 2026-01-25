# 🎬 GETTING STARTED - Visual Guide

## Step-by-Step Visual Instructions

### 🎯 Goal
Transform your CLI tool into a web application in 5 minutes.

---

## STEP 1️⃣: Install Dependencies

```
Your Project Folder
    |
    ├─ package.json
    ├─ src/
    └─ public/

    ↓ Run this command ↓
    
    npm install
    
    ↓ Creates this ↓
    
    node_modules/         (downloaded packages)
    package-lock.json     (dependency lock file)
```

**Expected output:**
```
added XX packages in X.XXs
```

**Time: 2-3 minutes** ⏱️

---

## STEP 2️⃣: Create Configuration File

```
Your Project Folder
    |
    ├─ .env.example      (template)
    
    ↓ Run this command ↓
    
    cp .env.example .env
    
    ↓ Creates this ↓
    
    .env                 (your config - EDIT THIS)
```

**Open `.env` file and add:**
```env
TAVILY_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb://localhost:27017
PORT=5000
```

**Get API key from:** https://tavily.com

**Time: 1-2 minutes** ⏱️

---

## STEP 3️⃣: Start MongoDB

**Option A: If MongoDB is installed locally**
```bash
mongod
```

**Option B: If using Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option C: If using cloud MongoDB**
```
Update MONGODB_URI in .env with your connection string
```

**You should see:**
```
[initandlisten] waiting for connections on port 27017
```

**Keep this terminal open!**

**Time: < 1 minute** ⏱️

---

## STEP 4️⃣: Start the Web Server

**Open a NEW terminal (don't close MongoDB terminal!)**

```bash
npm run server
```

**You should see:**
```
============================================================
🚀 Tavily Web Intelligence Server Started
============================================================
📍 Server: http://localhost:5000
🌐 Dashboard: http://localhost:5000/dashboard
🏥 Health: http://localhost:5000/api/health
============================================================
```

**Keep this terminal open!**

**Time: < 1 minute** ⏱️

---

## STEP 5️⃣: Open in Browser

**Open your web browser and go to:**
```
http://localhost:5000
```

**You should see:**
```
┌─────────────────────────────────────┐
│ 🔍 Tavily Web Intelligence          │
│ Automated Web Scraping & Research   │
└─────────────────────────────────────┘

[Search Panel] [Statistics Panel]

[Results Section]
```

---

## ✅ SUCCESS! You're Done!

Your application is now running! 🎉

---

## 🎮 Try It Out

### Test 1: Basic Search
1. Type a question: `"What is machine learning?"`
2. Click "🔍 Start Search"
3. Wait for results
4. See AI answer and sources

### Test 2: Multiple Queries
1. Enter 3 questions (one per line)
2. Set search depth to "Advanced"
3. Click "🔍 Start Search"
4. Watch real-time processing

### Test 3: Export Results
1. Click "📥 Export All Results"
2. JSON file downloads
3. Open in text editor to see structure

---

## 📊 Terminal Layout

You should have **2 terminals** open:

```
Terminal 1 (MongoDB)          Terminal 2 (Node Server)
─────────────────────────────────────────────────────
mongod running...            npm run server
[waiting for connection]     Server running on 5000
                             [listening for requests]
```

Both should be **running in background** ✅

---

## 🖥️ Browser Window

```
┌─ Firefox/Chrome/Safari ──────────────┐
│ http://localhost:5000                │
├──────────────────────────────────────┤
│                                      │
│  🔍 Tavily Web Intelligence          │
│  Automated Web Scraping & Research   │
│                                      │
│  ┌──────────────┬─────────────────┐ │
│  │ 🚀 Search    │ 📊 Statistics   │ │
│  │              │                 │ │
│  │ [Enter Qs]   │ [Counters]      │ │
│  │ [Options]    │ [History]       │ │
│  │ [Search]     │ [Export]        │ │
│  └──────────────┴─────────────────┘ │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 📋 Results                   │   │
│  │ (Results will appear here)   │   │
│  └──────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

---

## 🚨 What if Something Goes Wrong?

### ❌ "Cannot find module 'express'"
```
Solution: Run npm install again
npm install
```

### ❌ "Port 5000 already in use"
```
Solution: Edit .env file
Change: PORT=5000
To: PORT=5001

Then restart server
```

### ❌ "MongoDB connection failed"
```
Solution: Start MongoDB
mongod

If still fails, check connection string in .env
```

### ❌ "TAVILY_API_KEY not found"
```
Solution: Edit .env file
Add: TAVILY_API_KEY=your_actual_key
```

### ❌ "Blank page in browser"
```
Solution: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Restart server
```

**See SETUP_GUIDE.md for more troubleshooting**

---

## 📱 Mobile Testing

Your app works on phones too!

**On the same network:**
```
1. Find your computer's IP address
   Windows: ipconfig | findstr "IPv4"
   Mac/Linux: ifconfig | grep inet

2. On phone, go to:
   http://your_computer_ip:5000
   
3. Try searching from phone!
```

---

## 🔌 Alternative: React Development

If you want the React development experience:

**Terminal 1: MongoDB**
```bash
mongod
```

**Terminal 2: Express Backend**
```bash
npm run server
```

**Terminal 3: React Frontend** (NEW)
```bash
npm run dev
```

**Open browser to:** `http://localhost:3000`

This gives hot module reloading for faster development.

---

## 📚 Where to Go From Here

### Want to Learn More?
- **Features:** Read `FRONTEND_README.md`
- **API:** See "API Endpoints" in `FRONTEND_README.md`
- **Design:** Check `UI_DESIGN.md`
- **Setup Issues:** See `SETUP_GUIDE.md`

### Want to Customize?
- **Change Colors:** Edit `src/styles/dashboard.css`
- **Modify Layout:** Edit React components in `src/components/`
- **Add Features:** Extend `src/server.js`

### Want to Deploy?
- **Easy:** Keep current setup
- **Docker:** Create Dockerfile
- **Cloud:** Deploy to Heroku, AWS, Google Cloud

---

## ⚡ Quick Commands Reference

```bash
# Install dependencies
npm install

# Start Express server (main entry)
npm run server

# Start React dev server (optional)
npm run dev

# Run CLI tool (original)
npm start

# Copy environment template
cp .env.example .env

# View MongoDB data (if installed)
mongosh
```

---

## 🎯 5-Step Summary

1. ✅ **npm install** - Install dependencies (2-3 min)
2. ✅ **cp .env.example .env** - Create config (1 min)
3. ✅ **mongod** - Start database (< 1 min)
4. ✅ **npm run server** - Start web server (< 1 min)
5. ✅ **Open http://localhost:5000** - Use app (instant!)

**Total Time: 5 minutes** ⏱️

---

## 🎁 Pro Tips

💡 **Tip 1:** Keep both MongoDB and Server running  
💡 **Tip 2:** Use browser DevTools (F12) to debug  
💡 **Tip 3:** Try API endpoints in browser: `http://localhost:5000/api/health`  
💡 **Tip 4:** Export results often for backup  
💡 **Tip 5:** Read logs to understand what's happening  

---

## 🎓 What You're Running

```
Browser (Port 3000/5000)
    ↓
Express Server (Port 5000)
    ↓
    ├─ Tavily API (Cloud)
    ├─ MongoDB (Port 27017)
    └─ Storage

You → Browser → Server → Services → Results
```

---

## ✨ Features Now Available

✅ Search multiple queries  
✅ AI-powered answers  
✅ View source links  
✅ Track statistics  
✅ Export results  
✅ Search history  
✅ Use REST API  
✅ Store in database  

---

## 🚀 You're Ready!

Your web intelligence automation tool is now **live and running**!

```
Start Time:  Now
Time to Live: 5 minutes
Status: ✅ Running
Users: You!
```

---

## 📞 Need Help?

1. **Check Documentation:** `SETUP_GUIDE.md`
2. **Quick Reference:** `QUICK_REFERENCE.md`
3. **API Help:** `FRONTEND_README.md`
4. **Design Help:** `UI_DESIGN.md`

---

## 🎉 Congratulations!

You successfully deployed a full-stack web application!

**Next:** Open `http://localhost:5000` and start searching! 🔍

---

**Created:** January 25, 2026  
**Status:** Ready to Use ✅  
**Version:** 1.0.0
