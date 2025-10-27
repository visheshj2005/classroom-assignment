#!/bin/bash

# Classroom Assignment Portal Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting Classroom Assignment Portal Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Check environment variables
check_env() {
    print_status "Checking environment configuration..."
    
    if [ ! -f "server/.env" ]; then
        print_warning "server/.env file not found. Creating from example..."
        if [ -f "server/.env.example" ]; then
            cp server/.env.example server/.env
            print_warning "Please update server/.env with your configuration before continuing."
            print_warning "Press Enter to continue after updating the .env file..."
            read
        else
            print_error "server/.env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
    
    # Check required environment variables
    source server/.env
    
    if [ -z "$MONGODB_URI" ]; then
        print_error "MONGODB_URI is not set in server/.env"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        print_error "JWT_SECRET is not set in server/.env"
        exit 1
    fi
    
    print_success "Environment configuration is valid"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing client dependencies..."
    npm install
    
    # Install server dependencies
    print_status "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Build the application
build_application() {
    print_status "Building the application..."
    
    # Build client
    print_status "Building client application..."
    npm run build
    
    print_success "Application built successfully"
}

# Test database connection
test_database() {
    print_status "Testing database connection..."
    
    cd server
    node -e "
        import mongoose from 'mongoose';
        import dotenv from 'dotenv';
        
        dotenv.config();
        
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => {
                console.log('✅ Database connection successful');
                process.exit(0);
            })
            .catch((error) => {
                console.error('❌ Database connection failed:', error.message);
                process.exit(1);
            });
    "
    cd ..
    
    print_success "Database connection test passed"
}

# Seed demo data (optional)
seed_data() {
    read -p "Do you want to seed demo data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding demo data..."
        cd server
        npm run seed
        cd ..
        print_success "Demo data seeded successfully"
    fi
}

# Start the application
start_application() {
    print_status "Starting the application..."
    
    if [ "$1" = "production" ]; then
        print_status "Starting in production mode..."
        npm run start:prod
    else
        print_status "Starting in development mode..."
        npm run dev
    fi
}

# Main deployment function
deploy() {
    local mode=${1:-development}
    
    print_status "Deploying Classroom Assignment Portal in $mode mode..."
    
    # Pre-deployment checks
    check_node
    check_npm
    check_env
    
    # Installation and build
    install_dependencies
    build_application
    
    # Database setup
    test_database
    seed_data
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Application is ready to start."
    
    # Ask if user wants to start the application
    read -p "Do you want to start the application now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        start_application $mode
    else
        print_status "To start the application later, run:"
        if [ "$mode" = "production" ]; then
            print_status "  npm run start:prod"
        else
            print_status "  npm run dev"
        fi
    fi
}

# Handle script arguments
case "${1:-}" in
    "production"|"prod")
        deploy production
        ;;
    "development"|"dev"|"")
        deploy development
        ;;
    "test")
        print_status "Running deployment tests..."
        check_node
        check_npm
        check_env
        test_database
        print_success "All tests passed!"
        ;;
    "help"|"-h"|"--help")
        echo "Classroom Assignment Portal Deployment Script"
        echo ""
        echo "Usage: $0 [mode]"
        echo ""
        echo "Modes:"
        echo "  development (default) - Deploy for development"
        echo "  production           - Deploy for production"
        echo "  test                - Run deployment tests only"
        echo "  help                - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                  # Deploy for development"
        echo "  $0 production       # Deploy for production"
        echo "  $0 test            # Test deployment requirements"
        ;;
    *)
        print_error "Unknown mode: $1"
        print_status "Run '$0 help' for usage information"
        exit 1
        ;;
esac