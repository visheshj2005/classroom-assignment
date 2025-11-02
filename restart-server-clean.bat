@echo off
echo 🔄 Completely Restarting Server for CORS Fix...
echo.

echo 🛑 Killing any existing Node processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 🧹 Clearing Node cache...
cd server
if exist node_modules rmdir /s /q node_modules
npm install

echo 📝 Setting production environment...
set NODE_ENV=production

echo 🚀 Starting server with fresh configuration...
echo.
echo 🔗 Backend: http://localhost:5000
echo 🌐 Ngrok: https://paronymous-jacki-gelatinously.ngrok-free.dev
echo 📱 Frontend: https://classroom-assignment-pqcj.vercel.app
echo.
echo ⚠️  Make sure ngrok is running: ngrok http 5000
echo.

npm start