#!/bin/bash

# Google Cloud Run Deployment Script
set -e

echo "🚀 Starting Google Cloud Run deployment..."
echo "================================================"

# Configuration
PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="classroom-assignment"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if project ID is provided
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo "❌ Please provide your Google Cloud Project ID:"
    echo "   Usage: ./deploy-cloudrun.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Configuration:"
echo "   Project ID: $PROJECT_ID"
echo "   Service Name: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Image: $IMAGE_NAME"

# Set the project
echo "🔧 Setting Google Cloud project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the application
echo "🏗️  Building the application..."
npm run build

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

# Configure Docker to use gcloud as a credential helper
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker

# Push image to Container Registry
echo "📤 Pushing image to Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME:latest \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production,PORT=8080

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables: gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars KEY=VALUE"
echo "   2. Test the deployment: curl $SERVICE_URL/api/health"
echo "   3. Configure custom domain if needed"
echo ""
echo "🔧 To set environment variables, run:"
echo "   ./set-cloudrun-env.sh $PROJECT_ID"