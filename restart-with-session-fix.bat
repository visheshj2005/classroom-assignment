@echo off
echo 🔄 Restarting server with cross-origin session fix...
echo.

echo 📋 Configuration Summary:
echo - Session cookies: secure=true, sameSite=none
echo - CORS: credentials enabled
echo - Frontend: https://classroom-assignment-pqcj.vercel.app
echo - Backend: https://paronymous-jacki-gelatinously.ngrok-free.dev
echo.

echo 🛑 Stopping current server...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🚀 Starting server with new session configuration...
cd server
npm run dev