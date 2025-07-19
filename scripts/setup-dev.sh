#!/bin/bash

# scripts/setup-dev.sh
# Development environment setup script

echo "🚀 Setting up CRM development environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your database credentials"
    echo "💡 You can use the remote database or set up a local MySQL/MariaDB instance"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Test database connection
echo "🔍 Testing database connection..."
npm run db:test

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    
    # Check if we can reach the health endpoint (if server is running)
    echo "🏥 Testing health endpoint (if server is running)..."
    curl -s http://localhost:3000/api/health/database > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Health endpoint accessible"
    else
        echo "ℹ️  Health endpoint not accessible (server may not be running)"
        echo "💡 Start the development server with: npm run dev"
    fi
    
else
    echo "❌ Database connection failed"
    echo "💡 Please check your .env.local file and database setup"
    echo "📖 See DATABASE_CONNECTION_FIXES.md for troubleshooting"
    exit 1
fi

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local if you haven't already"
echo "2. Start the development server: npm run dev"
echo "3. Visit http://localhost:3000 to test the application"
echo "4. Use npm run db:health to test database connectivity"
echo ""
