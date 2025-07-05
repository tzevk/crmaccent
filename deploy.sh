#!/bin/bash

# CRM Accent - Vercel Deployment Script
echo "🚀 Preparing CRM Accent for Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Run build to check for errors
echo "🔨 Testing build process..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment initiated!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - DB_HOST=your-database-host"
echo "   - DB_PORT=3306"
echo "   - DB_NAME=your-database-name"
echo "   - DB_USER=your-database-user"
echo "   - DB_PASSWORD=your-database-password"
echo ""
echo "2. Set up your database using the setup API endpoint:"
echo "   https://your-app.vercel.app/api/setup-db"
echo ""
echo "3. Test authentication with your first admin user"
echo ""
echo "📚 Deployment complete! Check your Vercel dashboard for details."
