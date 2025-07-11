#!/bin/bash

# Supermarket Management System - Development Startup Script
# This script helps you start both frontend and backend servers

echo "🛒 Supermarket Management System - Development Setup"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if ports are available
echo "🔍 Checking port availability..."

if check_port 3000; then
    echo "⚠️  Port 3000 is already in use (Frontend)"
    echo "   Please stop any service running on port 3000"
fi

if check_port 5000; then
    echo "⚠️  Port 5000 is already in use (Backend)"
    echo "   Please stop any service running on port 5000"
fi

echo ""

# Install dependencies
echo "� Installing dependencies..."

echo "Installing frontend dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=g1_supermarket

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF
    echo "✅ Backend .env file created"
    echo "   Please update the database credentials in backend/.env"
else
    echo "✅ Backend .env file already exists"
fi

echo ""

# Check if .env file exists in frontend
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Application Configuration
REACT_APP_NAME=Supermarket Management System
REACT_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
EOF
    echo "✅ Frontend .env file created"
else
    echo "✅ Frontend .env file already exists"
fi

echo ""

# Database setup instructions
echo "🗄️  Database Setup Instructions:"
echo "   1. Make sure MySQL is running"
echo "   2. Create database: CREATE DATABASE g1_supermarket;"
echo "   3. Run the SQL script: backend/setup-database.sql"
echo "   4. Update database credentials in backend/.env"
echo ""

# Start servers
echo "🚀 Starting servers..."
echo ""

# Function to start backend
start_backend() {
    echo "Starting backend server..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    echo "Backend started with PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "Starting frontend server..."
    npm start &
    FRONTEND_PID=$!
    echo "Frontend started with PID: $FRONTEND_PID"
}

# Start backend
start_backend

# Wait a moment for backend to start
sleep 3

# Start frontend
start_frontend

echo ""
echo "🎉 System is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
echo ""
echo "🔑 Demo Credentials:"
echo "   Admin: admin / password"
echo "   Backend Dev: backend_dev / password"
echo "   Business Analyst: biz_analyst / password"
echo ""
echo "📋 Available Features:"
echo "   • Role-based access control"
echo "   • Sales analytics and reporting"
echo "   • User management (Admin only)"
echo "   • Real-time dashboard"
echo "   • Interactive charts and graphs"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Wait for user to stop
wait