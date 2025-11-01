@echo off
echo Testing Render Login Route with curl
echo =====================================

REM Replace with your actual render URL
set RENDER_URL=https://your-render-app.onrender.com
set LOCAL_URL=http://localhost:5000

REM Use LOCAL_URL for local testing, RENDER_URL for deployed testing
set BASE_URL=%LOCAL_URL%

echo Testing Health Endpoint...
curl -X GET "%BASE_URL%/api/health" -H "Content-Type: application/json"

echo.
echo.
echo Testing Login Endpoint...
echo URL: %BASE_URL%/api/auth/login

REM Replace with valid test credentials
curl -X POST "%BASE_URL%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"testpassword123\"}"

echo.
echo.
echo Test completed!
pause