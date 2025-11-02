@echo off
echo 🚀 Starting Ngrok Hybrid Deployment...
echo.

echo 📝 Updating environment variables...
echo VITE_API_URL=https://paronymous-jacki-gelatinously.ngrok-free.dev > .env
echo ✅ Updated .env file

echo.
echo 🏗️ Building frontend...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo 🌐 Deploying to Vercel...
call vercel --prod
if errorlevel 1 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo ✨ Frontend deployed successfully!
echo.
echo 🔧 Next steps:
echo 1. Start your backend: cd server ^&^& npm start
echo 2. Make sure ngrok is running: ngrok http 5000
echo 3. Your app is live at: https://classroom-assignment-pqcj.vercel.app
echo.
pause