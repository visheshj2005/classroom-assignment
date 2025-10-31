@echo off
REM Google Cloud Run Deployment Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting Google Cloud Run deployment...
echo ================================================

REM Configuration
set PROJECT_ID=%1
set SERVICE_NAME=classroom-assignment
set REGION=us-central1
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

REM Check if project ID is provided
if "%PROJECT_ID%"=="" (
    echo ❌ Please provide your Google Cloud Project ID:
    echo    Usage: deploy-cloudrun.bat YOUR_PROJECT_ID
    exit /b 1
)

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Google Cloud SDK not found. Please install it first:
    echo    https://cloud.google.com/sdk/docs/install
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found. Please install Docker first:
    echo    https://docs.docker.com/get-docker/
    exit /b 1
)

echo 📋 Configuration:
echo    Project ID: %PROJECT_ID%
echo    Service Name: %SERVICE_NAME%
echo    Region: %REGION%
echo    Image: %IMAGE_NAME%

REM Set the project
echo 🔧 Setting Google Cloud project...
gcloud config set project %PROJECT_ID%

REM Enable required APIs
echo 🔧 Enabling required APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

REM Build the application
echo 🏗️  Building the application...
npm run build

REM Build Docker image
echo 🐳 Building Docker image...
docker build -t %IMAGE_NAME%:latest .

REM Configure Docker to use gcloud as a credential helper
echo 🔐 Configuring Docker authentication...
gcloud auth configure-docker

REM Push image to Container Registry
echo 📤 Pushing image to Container Registry...
docker push %IMAGE_NAME%:latest

REM Deploy to Cloud Run
echo 🚀 Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
    --image %IMAGE_NAME%:latest ^
    --region %REGION% ^
    --platform managed ^
    --allow-unauthenticated ^
    --port 8080 ^
    --memory 1Gi ^
    --cpu 1 ^
    --max-instances 10 ^
    --timeout 300 ^
    --set-env-vars NODE_ENV=production,PORT=8080

REM Get the service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)"') do set SERVICE_URL=%%i

echo ✅ Deployment completed successfully!
echo 🌐 Service URL: %SERVICE_URL%
echo.
echo 📋 Next steps:
echo    1. Set environment variables: set-cloudrun-env.bat %PROJECT_ID%
echo    2. Test the deployment: curl %SERVICE_URL%/api/health
echo    3. Configure custom domain if needed