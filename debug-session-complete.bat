@echo off
echo 🔍 Complete Session Debugging
echo ============================
echo.

echo 📋 This will help diagnose the session persistence issue:
echo 1. Added detailed session logging to auth middleware
echo 2. Added session creation logging to login controller
echo 3. Testing session persistence with script
echo.

echo 🚀 Make sure your server is running, then:
echo.

echo 1️⃣ Testing session persistence...
node test-session-persistence.js

echo.
echo 2️⃣ Now check your server console logs for:
echo.
echo ✅ During LOGIN - Look for:
echo    - "📝 Session created for user: [user-id]"
echo    - "🔍 Session Debug:" with session details
echo    - "Session ID:", "Session userId:", etc.
echo.
echo ✅ During DATA FETCH - Look for:
echo    - "🔍 Auth Middleware Debug:"
echo    - "Session exists:", "Session userId:", "Cookies:"
echo    - If you see "❌ Session validation failed" - that's the problem!
echo.
echo 📝 Common issues and solutions:
echo.
echo ❌ If "Session exists: false":
echo    - Session cookie not being sent by browser
echo    - Check cookie attributes (secure, sameSite, domain)
echo    - Clear browser cookies and try again
echo.
echo ❌ If "Session userId: undefined":
echo    - Session exists but userId not stored
echo    - Check MongoDB session store connection
echo    - Session might be corrupted
echo.
echo ❌ If "Cookies: Missing":
echo    - Browser not sending cookies at all
echo    - CORS withCredentials issue
echo    - ngrok tunnel blocking cookies
echo.
echo 🔧 Quick fixes to try:
echo 1. Restart server to apply new logging
echo 2. Clear ALL browser cookies
echo 3. Try in a fresh incognito window
echo 4. Check if ngrok tunnel is stable
echo.
pause