#!/bin/bash

echo "🚀 Starting Supermarket Management System"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
fi

# Start backend server in background
echo "🔧 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend server is running on http://localhost:5000"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎯 Demo Credentials:"
echo "   Admin: admin@supermarket.com / admin123"
echo "   Manager: manager@supermarket.com / manager123" 
echo "   Cashier: cashier@supermarket.com / cashier123"
echo "   User: user@supermarket.com / user123"
echo ""
echo "🌐 Starting frontend server..."
echo "   Frontend will be available at: http://localhost:3000"
echo "   Backend API available at: http://localhost:5000/api"
echo ""

# Start frontend
npm start

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT