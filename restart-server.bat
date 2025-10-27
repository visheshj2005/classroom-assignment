@echo off
echo 🔄 Restarting server with fixes...

REM Kill any existing node processes
taskkill /f /im node.exe >nul 2>&1

echo ✅ Fixed duplicate index warnings
echo ✅ Fixed middleware conflicts
echo.

REM Test database connection
echo 🗄️ Testing database connection...
cd server
node testConnection.js
if %errorlevel% neq 0 (
    echo ❌ Database connection failed. Please check MongoDB setup.
    pause
    exit /b 1
)
cd ..

echo ✅ Database connection successful!
echo.

echo 🚀 Starting application...
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo 🏥 Health: http://localhost:5000/api/health
echo.

call npm run dev