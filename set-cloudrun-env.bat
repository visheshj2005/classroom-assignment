@echo off
REM Set environment variables for Cloud Run service (Windows)
setlocal enabledelayedexpansion

echo 🔧 Setting up Cloud Run environment variables...
echo ================================================

REM Configuration
set PROJECT_ID=%1
set SERVICE_NAME=classroom-assignment
set REGION=us-central1

REM Check if project ID is provided
if "%PROJECT_ID%"=="" (
    echo ❌ Please provide your Google Cloud Project ID:
    echo    Usage: set-cloudrun-env.bat YOUR_PROJECT_ID
    exit /b 1
)

REM Check if server/.env exists
if not exist "server\.env" (
    echo ❌ server/.env file not found
    echo 💡 Please create server/.env with your configuration
    exit /b 1
)

echo 📋 Reading environment variables from server/.env...

REM Build environment variables string from server/.env
set ENV_VARS=NODE_ENV=production,PORT=8080

REM Read key environment variables from server/.env
for /f "usebackq tokens=1,2 delims==" %%a in ("server\.env") do (
    set key=%%a
    set value=%%b
    
    REM Skip comments and empty lines
    if not "!key:~0,1!"=="#" if not "!key!"=="" (
        REM Add important variables to ENV_VARS
        if "!key!"=="MONGODB_URI" set ENV_VARS=!ENV_VARS!,MONGODB_URI=!value!
        if "!key!"=="JWT_SECRET" set ENV_VARS=!ENV_VARS!,JWT_SECRET=!value!
        if "!key!"=="JWT_EXPIRES_IN" set ENV_VARS=!ENV_VARS!,JWT_EXPIRES_IN=!value!
        if "!key!"=="BCRYPT_ROUNDS" set ENV_VARS=!ENV_VARS!,BCRYPT_ROUNDS=!value!
        if "!key!"=="EMAIL_SERVICE" set ENV_VARS=!ENV_VARS!,EMAIL_SERVICE=!value!
        if "!key!"=="EMAIL_USER" set ENV_VARS=!ENV_VARS!,EMAIL_USER=!value!
        if "!key!"=="EMAIL_PASS" set ENV_VARS=!ENV_VARS!,EMAIL_PASS=!value!
        if "!key!"=="EMAIL_FROM" set ENV_VARS=!ENV_VARS!,EMAIL_FROM=!value!
        if "!key!"=="ENABLE_ANALYTICS" set ENV_VARS=!ENV_VARS!,ENABLE_ANALYTICS=!value!
        if "!key!"=="ENABLE_NOTIFICATIONS" set ENV_VARS=!ENV_VARS!,ENABLE_NOTIFICATIONS=!value!
        if "!key!"=="ENABLE_FILE_UPLOADS" set ENV_VARS=!ENV_VARS!,ENABLE_FILE_UPLOADS=!value!
    )
)

echo 🚀 Updating Cloud Run service with environment variables...

REM Update the Cloud Run service with environment variables
gcloud run services update %SERVICE_NAME% ^
    --region=%REGION% ^
    --set-env-vars="%ENV_VARS%" ^
    --project=%PROJECT_ID%

echo ✅ Environment variables updated successfully!

REM Get the service URL
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --region=%REGION% --format="value(status.url)" --project=%PROJECT_ID%') do set SERVICE_URL=%%i

echo 🌐 Service URL: %SERVICE_URL%
echo.
echo 🧪 Testing the deployment...
echo    Health check: curl %SERVICE_URL%/api/health
echo    API test: curl %SERVICE_URL%/api/test
echo.
echo 📋 Next steps:
echo    1. Test user registration and login
echo    2. Verify email functionality
echo    3. Configure custom domain if needed
echo    4. Set up monitoring and logging