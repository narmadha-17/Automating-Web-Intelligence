@echo off
REM ========================================
REM Tavily Web Intelligence - Quick Start
REM ========================================

echo.
echo 🚀 Starting Tavily Web Intelligence...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Check for .env file
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo 📝 Creating from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env and add your TAVILY_API_KEY
    echo 📝 Then run this script again.
    pause
    exit /b
)

echo ✅ Environment configured
echo.

REM Start MongoDB
echo 🗄️  Checking MongoDB...
tasklist | find /i "mongod" >nul
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB not running. Starting...
    start mongod
    timeout /t 3
)

REM Start the server
echo.
echo 🌐 Starting Web Server on http://localhost:5000...
echo.
start http://localhost:5000
timeout /t 2

node src/server.js

pause
