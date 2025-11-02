#!/bin/bash

# Debug commands to test login functionality
# Run these commands to test your API directly

API_URL="https://classroom-assignment-50uu.onrender.com/api"

echo "🔍 DEBUGGING LOGIN FUNCTIONALITY"
echo "================================="

echo ""
echo "1️⃣ Testing Health Check..."
curl -X GET "$API_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "2️⃣ Testing API Endpoint..."
curl -X GET "$API_URL/test" \
  -H "Content-Type: application/json" \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "3️⃣ Testing Login - admin@example.com..."
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "4️⃣ Testing Login - viditj47@gmail.com..."
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "viditj47@gmail.com", "password": "Visheshjain18@"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "5️⃣ Testing Login - admin@classroom.com..."
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@classroom.com", "password": "admin123"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "6️⃣ Testing Login - sarah.johnson@classroom.com..."
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "sarah.johnson@classroom.com", "password": "teacher123"}' \
  -w "\nStatus Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "7️⃣ Testing with common passwords for any existing users..."
echo "Try these manually with emails found in your database:"
echo "  - admin123"
echo "  - teacher123" 
echo "  - student123"
echo "  - password123"
echo "  - Visheshjain18@"

echo ""
echo "================================="
echo "✅ Debug tests complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Run: node check-existing-users.js"
echo "2. Import postman-debug-collection.json into Postman"
echo "3. Use the emails found in step 1 with common passwords"
echo "4. Check Render logs for detailed login debugging"