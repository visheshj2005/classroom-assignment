#!/bin/bash

# Classroom Assignment Portal - Local Testing Startup Script

echo "🧪 Starting Classroom Assignment Portal for Local Testing..."
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

print_success "Node.js found: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing client dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    print_status "Installing server dependencies..."
    cd server
    npm install
    cd ..
fi

# Check if .env exists
if [ ! -f "server/.env" ]; then
    print_status "Creating environment file..."
    cp server/.env.example server/.env
    print_warning "Please update server/.env with your MongoDB connection string"
    print_warning "Press Enter to continue after updating .env..."
    read
fi

# Test database connection
print_status "Testing database connection..."
cd server
if ! node testConnection.js; then
    print_error "Database connection failed. Please check your MongoDB setup."
    print_status "Make sure MongoDB is running or update MONGODB_URI in server/.env"
    exit 1
fi
cd ..

# Ask about seeding demo data
read -p "🌱 Do you want to seed demo data? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    print_status "Seeding demo data..."
    cd server
    npm run seed
    cd ..
    echo
    print_success "Demo accounts created:"
    echo "   Admin: admin@classroom.com / admin123"
    echo "   Teacher: sarah.johnson@classroom.com / teacher123"
    echo "   Student: alice.smith@student.com / student123"
    echo
fi

print_status "Starting the application..."
echo
print_success "Frontend will be available at: http://localhost:5173"
print_success "Backend API will be available at: http://localhost:5000"
print_success "Health check: http://localhost:5000/api/health"
echo
print_status "Open LOCAL-TESTING-GUIDE.md for detailed testing instructions"
echo
print_warning "Press Ctrl+C to stop the servers"
echo

# Start both frontend and backend
npm run dev