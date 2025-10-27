@echo off
setlocal enabledelayedexpansion

REM Classroom Assignment Portal Deployment Script for Windows
REM This script handles the complete deployment process

echo 🚀 Starting Classroom Assignment Portal Deployment...

REM Function to check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION:~1%") do set MAJOR_VERSION=%%i
if %MAJOR_VERSION% lss 18 (
    echo ❌ [ERROR] Node.js version 18+ is required. Current version: %NODE_VERSION%
    pause
    exit /b 1
)

echo ✅ [SUCCESS] Node.js %NODE_VERSION% is installed

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ [ERROR] npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

for /f %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ [SUCCESS] npm %NPM_VERSION% is installed

REM Check environment configuration
echo 📋 [INFO] Checking environment configuration...

if not exist "server\.env" (
    echo ⚠️ [WARNING] server\.env file not found. Creating from example...
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo ⚠️ [WARNING] Please update server\.env with your configuration before continuing.
        echo ⚠️ [WARNING] Press any key to continue after updating the .env file...
        pause >nul
    ) else (
        echo ❌ [ERROR] server\.env.example file not found. Cannot create .env file.
        pause
        exit /b 1
    )
)

echo ✅ [SUCCESS] Environment configuration found

REM Install dependencies
echo 📦 [INFO] Installing dependencies...

echo 📦 [INFO] Installing client dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Failed to install client dependencies
    pause
    exit /b 1
)

echo 📦 [INFO] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Failed to install server dependencies
    pause
    exit /b 1
)
cd ..

echo ✅ [SUCCESS] Dependencies installed successfully

REM Build the application
echo 🔨 [INFO] Building the application...

echo 🔨 [INFO] Building client application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ [ERROR] Failed to build client application
    pause
    exit /b 1
)

echo ✅ [SUCCESS] Application built successfully

REM Test database connection
echo 🗄️ [INFO] Testing database connection...
cd server
node -e "import('./testConnection.js')" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ [WARNING] Could not test database connection automatically
    echo ⚠️ [WARNING] Please ensure your MongoDB connection is working
)
cd ..

REM Ask about seeding demo data
set /p SEED_DATA="Do you want to seed demo data? (y/N): "
if /i "%SEED_DATA%"=="y" (
    echo 🌱 [INFO] Seeding demo data...
    cd server
    call npm run seed
    if %errorlevel% neq 0 (
        echo ⚠️ [WARNING] Failed to seed demo data, but continuing...
    ) else (
        echo ✅ [SUCCESS] Demo data seeded successfully
    )
    cd ..
)

echo 🎉 [SUCCESS] Deployment completed successfully!
echo 📋 [INFO] Application is ready to start.

REM Ask if user wants to start the application
set /p START_APP="Do you want to start the application now? (Y/n): "
if /i not "%START_APP%"=="n" (
    if "%1"=="production" (
        echo 🚀 [INFO] Starting in production mode...
        call npm run start:prod
    ) else (
        echo 🚀 [INFO] Starting in development mode...
        call npm run dev
    )
) else (
    echo 📋 [INFO] To start the application later, run:
    if "%1"=="production" (
        echo   npm run start:prod
    ) else (
        echo   npm run dev
    )
    pause
)

endlocal