@echo off
echo 🔧 Fixing ngrok Network Issues
echo ==============================
echo.

echo 📋 Common ngrok issues being addressed:
echo 1. Missing ngrok-skip-browser-warning header
echo 2. Request timeouts
echo 3. Network connectivity problems
echo 4. CORS issues with ngrok tunnels
echo.

echo ✅ Applied fixes:
echo - Added ngrok-skip-browser-warning header to all API calls
echo - Increased request timeout to 10 seconds
echo - Enhanced error diagnostics in AuthDebugger
echo - Better network error handling
echo.

echo 🧪 Testing ngrok connectivity...
node test-ngrok-connectivity.js

echo.
echo 📝 If issues persist, try these steps:
echo.
echo 1. Restart ngrok tunnel:
echo    ngrok http 5000
echo.
echo 2. Update your .env file with the new ngrok URL:
echo    VITE_API_URL=https://your-new-ngrok-url.ngrok-free.dev/api
echo.
echo 3. Clear browser cache and cookies completely
echo.
echo 4. Check Windows Firewall/Antivirus settings for ngrok
echo.
echo 5. Try using ngrok with auth token:
echo    ngrok config add-authtoken YOUR_TOKEN
echo    ngrok http 5000
echo.
echo 🔍 Current ngrok URL in .env:
type .env | findstr VITE_API_URL
echo.
pause