@echo off
echo 🚀 Starting Classroom Portal Development Environment...
echo.

echo 📡 Starting backend server...
start "Backend Server" cmd /c "cd server && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 🎨 Starting frontend development server...
start "Frontend Server" cmd /c "npm run dev"

echo.
echo 📋 Development Environment Started!
echo 🔗 Frontend: http://localhost:5173
echo 🔗 Backend: http://localhost:5000
echo.
echo 💡 Demo Accounts:
echo 👨‍🏫 Teacher: teacher@example.com / password123
echo 👨‍🎓 Student: student@example.com / password123  
echo 👨‍💼 Admin: admin@example.com / password123
echo.
echo Press any key to close this window...
pause > nul