#!/bin/bash

# Set environment variables for Cloud Run service
set -e

echo "🔧 Setting up Cloud Run environment variables..."
echo "================================================"

# Configuration
PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="classroom-assignment"
REGION="us-central1"

# Check if project ID is provided
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo "❌ Please provide your Google Cloud Project ID:"
    echo "   Usage: ./set-cloudrun-env.sh YOUR_PROJECT_ID"
    exit 1
fi

# Check if server/.env exists
if [ ! -f "server/.env" ]; then
    echo "❌ server/.env file not found"
    echo "💡 Please create server/.env with your configuration"
    exit 1
fi

echo "📋 Reading environment variables from server/.env..."

# Read environment variables from server/.env and prepare them for Cloud Run
ENV_VARS=""

# Required environment variables
declare -A REQUIRED_VARS=(
    ["MONGODB_URI"]=""
    ["JWT_SECRET"]=""
    ["JWT_EXPIRES_IN"]="7d"
    ["NODE_ENV"]="production"
    ["PORT"]="8080"
    ["BCRYPT_ROUNDS"]="12"
    ["RATE_LIMIT_WINDOW_MS"]="900000"
    ["RATE_LIMIT_MAX_REQUESTS"]="200"
    ["AUTH_RATE_LIMIT_MAX"]="10"
    ["EMAIL_SERVICE"]=""
    ["EMAIL_USER"]=""
    ["EMAIL_PASS"]=""
    ["EMAIL_FROM"]=""
    ["ENABLE_ANALYTICS"]="true"
    ["ENABLE_NOTIFICATIONS"]="true"
    ["ENABLE_FILE_UPLOADS"]="true"
    ["MAX_FILE_SIZE"]="50MB"
    ["ANALYTICS_RETENTION_DAYS"]="365"
    ["NOTIFICATION_RETENTION_DAYS"]="30"
)

# Read values from server/.env
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ $key =~ ^[[:space:]]*# ]] || [[ -z $key ]]; then
        continue
    fi
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # If this is a required variable, store its value
    if [[ -n "${REQUIRED_VARS[$key]+exists}" ]]; then
        REQUIRED_VARS[$key]="$value"
    fi
done < server/.env

# Build environment variables string
for key in "${!REQUIRED_VARS[@]}"; do
    value="${REQUIRED_VARS[$key]}"
    if [[ -n "$value" ]]; then
        if [[ -n "$ENV_VARS" ]]; then
            ENV_VARS="$ENV_VARS,$key=$value"
        else
            ENV_VARS="$key=$value"
        fi
    fi
done

# Check if we have the minimum required variables
if [[ -z "${REQUIRED_VARS[MONGODB_URI]}" ]]; then
    echo "❌ MONGODB_URI is required but not found in server/.env"
    exit 1
fi

if [[ -z "${REQUIRED_VARS[JWT_SECRET]}" ]]; then
    echo "❌ JWT_SECRET is required but not found in server/.env"
    exit 1
fi

echo "🚀 Updating Cloud Run service with environment variables..."

# Update the Cloud Run service with environment variables
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --set-env-vars="$ENV_VARS" \
    --project=$PROJECT_ID

echo "✅ Environment variables updated successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID)

echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "🧪 Testing the deployment..."
echo "   Health check: curl $SERVICE_URL/api/health"
echo "   API test: curl $SERVICE_URL/api/test"
echo ""
echo "📋 Next steps:"
echo "   1. Test user registration and login"
echo "   2. Verify email functionality"
echo "   3. Configure custom domain if needed"
echo "   4. Set up monitoring and logging"