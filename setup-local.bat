@echo off
echo 🚀 Setting up Classroom Assignment Portal for Local Development
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    echo 💡 Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
echo.

echo Installing client dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ Dependencies installed successfully
echo.

REM Check MongoDB setup
echo 🗄️ MongoDB Setup Options:
echo.
echo 1. Use Local MongoDB (recommended for development)
echo 2. Use MongoDB Atlas (cloud database)
echo.
set /p DB_CHOICE="Choose option (1 or 2): "

if "%DB_CHOICE%"=="1" (
    echo.
    echo 📋 Local MongoDB Setup:
    echo 1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
    echo 2. Install and start MongoDB service
    echo 3. MongoDB will run on: mongodb://localhost:27017
    echo.
    echo ⚠️ Make sure MongoDB is running before starting the application
    echo.
) else if "%DB_CHOICE%"=="2" (
    echo.
    echo 📋 MongoDB Atlas Setup:
    echo 1. Go to: https://www.mongodb.com/atlas
    echo 2. Create free account and cluster
    echo 3. Get connection string
    echo 4. Update MONGODB_URI in server\.env
    echo.
)

REM Create .env if it doesn't exist
if not exist "server\.env" (
    echo ⚙️ Creating environment configuration...
    copy "server\.env.example" "server\.env" >nul
    echo ✅ Created server\.env file
    echo.
    echo ⚠️ IMPORTANT: Please update server\.env with your settings:
    if "%DB_CHOICE%"=="1" (
        echo    - MONGODB_URI=mongodb://localhost:27017/classroom-assignment
    ) else (
        echo    - MONGODB_URI=your-mongodb-atlas-connection-string
    )
    echo    - JWT_SECRET=your-secret-key-minimum-32-characters
    echo.
)

echo 🎉 Setup completed!
echo.
echo 📋 Next Steps:
echo 1. Make sure MongoDB is running
if "%DB_CHOICE%"=="1" (
    echo    - Start MongoDB service on your system
) else (
    echo    - Update MONGODB_URI in server\.env with your Atlas connection string
)
echo 2. Update server\.env with your configuration
echo 3. Run: npm run dev
echo.
echo 📖 For detailed testing instructions, see: LOCAL-TESTING-GUIDE.md
echo.
pause