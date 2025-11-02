@echo off
echo 🔧 Fixing Vercel Environment Variables...
echo.

echo 📝 Setting VITE_API_URL to: https://paronymous-jacki-gelatinously.ngrok-free.dev/api
echo.

echo ⚠️  You need to set this manually in Vercel dashboard:
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select project: classroom-assignment-pqcj
echo 3. Go to: Settings → Environment Variables
echo 4. Add/Update: VITE_API_URL
echo 5. Value: https://paronymous-jacki-gelatinously.ngrok-free.dev/api
echo 6. Environment: Production
echo 7. Save and redeploy
echo.

echo 🏗️ Building and deploying with updated environment...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo 🚀 Deploying to Vercel...
call vercel --prod
if errorlevel 1 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)

echo.
echo ✅ Deployment complete!
echo 🌐 Test your app at: https://classroom-assignment-pqcj.vercel.app
echo.
pause