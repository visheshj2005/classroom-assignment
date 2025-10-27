@echo off
echo 🔧 Fixing MongoDB connection and starting application...
echo.

REM Stop any running processes
taskkill /f /im node.exe >nul 2>&1

echo ✅ Fixed MongoDB connection options
echo.

REM Test database connection first
echo 🗄️ Testing database connection...
cd server
node testConnection.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Database connection failed!
    echo.
    echo 💡 Quick Setup Options:
    echo.
    echo Option 1 - Local MongoDB:
    echo   1. Download from: https://www.mongodb.com/try/download/community
    echo   2. Install and start MongoDB service
    echo   3. Connection will be: mongodb://localhost:27017/classroom-assignment
    echo.
    echo Option 2 - MongoDB Atlas (Cloud):
    echo   1. Go to: https://www.mongodb.com/atlas
    echo   2. Create free cluster
    echo   3. Update MONGODB_URI in server\.env
    echo.
    echo 📖 See MONGODB-SETUP.md for detailed instructions
    echo.
    pause
    exit /b 1
)
cd ..

echo ✅ Database connection successful!
echo.

REM Seed demo data if needed
set /p SEED_DATA="🌱 Seed demo data? (Y/n): "
if /i not "%SEED_DATA%"=="n" (
    echo Seeding demo data...
    cd server
    call npm run seed
    cd ..
    echo.
    echo 👥 Demo accounts:
    echo    Admin: admin@classroom.com / admin123
    echo    Teacher: sarah.johnson@classroom.com / teacher123
    echo    Student: alice.smith@student.com / student123
    echo.
)

echo 🚀 Starting application...
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo 🏥 Health: http://localhost:5000/api/health
echo.
echo ⏹️ Press Ctrl+C to stop
echo.

REM Start the application
call npm run dev