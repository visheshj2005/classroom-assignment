@echo off
echo 🧪 Starting Classroom Assignment Portal for Local Testing...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing client dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo 📦 Installing server dependencies...
    cd server
    call npm install
    cd ..
)

REM Check if .env exists
if not exist "server\.env" (
    echo ⚙️ Creating environment file...
    copy "server\.env.example" "server\.env" >nul
    echo ⚠️ Please update server\.env with your MongoDB connection string
    echo ⚠️ Press any key to continue after updating .env...
    pause >nul
)

REM Test database connection
echo 🗄️ Testing database connection...
cd server
node testConnection.js
if %errorlevel% neq 0 (
    echo ❌ Database connection failed. Please check your MongoDB setup.
    echo 💡 Make sure MongoDB is running or update MONGODB_URI in server\.env
    pause
    exit /b 1
)
cd ..

REM Ask about seeding demo data
set /p SEED_DATA="🌱 Do you want to seed demo data? (Y/n): "
if /i not "%SEED_DATA%"=="n" (
    echo 🌱 Seeding demo data...
    cd server
    call npm run seed
    cd ..
    echo.
    echo 👥 Demo accounts created:
    echo    Admin: admin@classroom.com / admin123
    echo    Teacher: sarah.johnson@classroom.com / teacher123
    echo    Student: alice.smith@student.com / student123
    echo.
)

echo 🚀 Starting the application...
echo.
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend API will be available at: http://localhost:5000
echo 🏥 Health check: http://localhost:5000/api/health
echo.
echo 📖 Open LOCAL-TESTING-GUIDE.md for detailed testing instructions
echo.
echo ⏹️ Press Ctrl+C to stop the servers
echo.

REM Start both frontend and backend
call npm run dev