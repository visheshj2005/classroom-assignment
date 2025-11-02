@echo off
echo 🚀 Starting Backend Server for Ngrok Hybrid Deployment...
echo.

cd server

echo 📝 Setting production environment...
set NODE_ENV=production

echo 🔧 Starting server with production settings...
echo Backend will be available at: http://localhost:5000
echo Ngrok tunnel: https://paronymous-jacki-gelatinously.ngrok-free.dev
echo Frontend: https://classroom-assignment-pqcj.vercel.app
echo.

npm start