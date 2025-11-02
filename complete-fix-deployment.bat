@echo off
echo 🔧 Complete Deployment Fix Script
echo ================================
echo.

echo 📋 Issues being fixed:
echo 1. Cross-origin session cookies (secure=true, sameSite=none)
echo 2. Forgot/Reset password using wrong API URL
echo 3. 401 Unauthorized on /api/auth/me
echo.

echo 🛑 Step 1: Stopping current server...
taskkill /f /im node.exe 2>nul
taskkill /f /im nodemon.exe 2>nul
timeout /t 2 /nobreak >nul

echo 📦 Step 2: Installing dependencies (if needed)...
cd server
call npm install --silent
cd ..

echo 🚀 Step 3: Starting server with new configuration...
echo - SESSION_SECRET: Set
echo - Cookie secure: true
echo - Cookie sameSite: none
echo - CORS credentials: enabled
echo.

start "Backend Server" cmd /k "cd server && npm run dev"

echo ⏳ Waiting for server to start...
timeout /t 5 /nobreak >nul

echo 🧪 Step 4: Testing the fix...
node test-session-after-restart.js

echo.
echo 📝 Next steps:
echo 1. Clear all cookies in your browser
echo 2. Go to https://classroom-assignment-pqcj.vercel.app
echo 3. Try logging in with: admin@example.com / Visheshjain18@
echo 4. Test forgot password functionality
echo.
echo ✅ Fix complete! Your deployment should now work correctly.
pause