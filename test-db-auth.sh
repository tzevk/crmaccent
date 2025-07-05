#!/bin/bash

echo "🧪 Testing CRM Accent Database Authentication"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000"

echo "1. Testing Admin User..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}')

if [[ $ADMIN_RESPONSE == *"Sign in successful"* ]]; then
  echo "✅ Admin login: SUCCESS"
  echo "   User: $(echo $ADMIN_RESPONSE | jq -r '.user.first_name') $(echo $ADMIN_RESPONSE | jq -r '.user.last_name')"
  echo "   Role: $(echo $ADMIN_RESPONSE | jq -r '.user.role')"
  echo "   Demo Mode: $(echo $ADMIN_RESPONSE | jq -r '.demo')"
else
  echo "❌ Admin login: FAILED"
  echo "   Response: $ADMIN_RESPONSE"
fi

echo ""
echo "2. Testing Manager User..."
MANAGER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "manager", "password": "password123"}')

if [[ $MANAGER_RESPONSE == *"Sign in successful"* ]]; then
  echo "✅ Manager login: SUCCESS"
  echo "   User: $(echo $MANAGER_RESPONSE | jq -r '.user.first_name') $(echo $MANAGER_RESPONSE | jq -r '.user.last_name')"
  echo "   Role: $(echo $MANAGER_RESPONSE | jq -r '.user.role')"
  echo "   Demo Mode: $(echo $MANAGER_RESPONSE | jq -r '.demo')"
else
  echo "❌ Manager login: FAILED"
  echo "   Response: $MANAGER_RESPONSE"
fi

echo ""
echo "3. Testing Regular User..."
USER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}')

if [[ $USER_RESPONSE == *"Sign in successful"* ]]; then
  echo "✅ Regular user login: SUCCESS"
  echo "   User: $(echo $USER_RESPONSE | jq -r '.user.first_name') $(echo $USER_RESPONSE | jq -r '.user.last_name')"
  echo "   Role: $(echo $USER_RESPONSE | jq -r '.user.role')"
  echo "   Demo Mode: $(echo $USER_RESPONSE | jq -r '.demo')"
else
  echo "❌ Regular user login: FAILED"
  echo "   Response: $USER_RESPONSE"
fi

echo ""
echo "4. Testing Invalid Credentials..."
INVALID_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "wrongpassword"}')

if [[ $INVALID_RESPONSE == *"Invalid username or password"* ]]; then
  echo "✅ Invalid credentials: PROPERLY REJECTED"
else
  echo "❌ Invalid credentials: SECURITY ISSUE"
  echo "   Response: $INVALID_RESPONSE"
fi

echo ""
echo "5. Testing Database Connection..."
DB_RESPONSE=$(curl -s -X GET $BASE_URL/api/test-db)

if [[ $DB_RESPONSE == *"Database connection successful"* ]]; then
  echo "✅ Database connection: SUCCESS"
  echo "   Host: $(echo $DB_RESPONSE | jq -r '.config.host')"
  echo "   Database: $(echo $DB_RESPONSE | jq -r '.config.database')"
  echo "   Tables: $(echo $DB_RESPONSE | jq -r '.tables | length') found"
else
  echo "❌ Database connection: FAILED"
  echo "   Response: $DB_RESPONSE"
fi

echo ""
echo "=============================================="
echo "🎉 Database Authentication Test Complete!"
echo "=============================================="
