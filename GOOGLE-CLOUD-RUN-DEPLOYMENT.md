# 🚀 Google Cloud Run Deployment Guide

## Overview
This guide will help you deploy your Classroom Assignment Portal to Google Cloud Run, a fully managed serverless platform that automatically scales your containerized applications.

## Prerequisites

### 1. Google Cloud Account
- Create a Google Cloud account at https://cloud.google.com/
- Create a new project or select an existing one
- Enable billing for your project

### 2. Required Tools
- **Google Cloud SDK**: https://cloud.google.com/sdk/docs/install
- **Docker**: https://docs.docker.com/get-docker/
- **Node.js**: Already installed

### 3. Authentication
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

#### For Linux/Mac:
```bash
# Make scripts executable
chmod +x deploy-cloudrun.sh
chmod +x set-cloudrun-env.sh

# Deploy the application
./deploy-cloudrun.sh YOUR_PROJECT_ID

# Set environment variables
./set-cloudrun-env.sh YOUR_PROJECT_ID
```

#### For Windows:
```cmd
# Deploy the application
deploy-cloudrun.bat YOUR_PROJECT_ID

# Set environment variables
set-cloudrun-env.bat YOUR_PROJECT_ID
```

### Option 2: Manual Deployment

#### Step 1: Enable APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

#### Step 2: Build the Application
```bash
npm run build
```

#### Step 3: Build and Push Docker Image
```bash
# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/classroom-assignment .

# Configure Docker authentication
gcloud auth configure-docker

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/classroom-assignment
```

#### Step 4: Deploy to Cloud Run
```bash
gcloud run deploy classroom-assignment \
    --image gcr.io/YOUR_PROJECT_ID/classroom-assignment \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars NODE_ENV=production,PORT=8080
```

#### Step 5: Set Environment Variables
```bash
gcloud run services update classroom-assignment \
    --region us-central1 \
    --set-env-vars MONGODB_URI="your-mongodb-uri",JWT_SECRET="your-jwt-secret",EMAIL_SERVICE="gmail",EMAIL_USER="your-email",EMAIL_PASS="your-app-password",EMAIL_FROM="your-email"
```

## 🔧 Environment Variables

Set these environment variables in Cloud Run:

### Required Variables
```bash
MONGODB_URI=mongodb+srv://visheshj2005:Visheshjain18@classroom-portal.dl5nzmz.mongodb.net/?appName=classroom-portal
JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=8080
BCRYPT_ROUNDS=12
EMAIL_SERVICE=gmail
EMAIL_USER=visheshj2005@gmail.com
EMAIL_PASS=wxxjnvemknawzrkf
EMAIL_FROM=visheshj2005@gmail.com
```

### Optional Variables
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=10
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_FILE_UPLOADS=true
MAX_FILE_SIZE=50MB
ANALYTICS_RETENTION_DAYS=365
NOTIFICATION_RETENTION_DAYS=30
```

## 🧪 Testing Your Deployment

After deployment, test these endpoints:

### 1. Health Check
```bash
curl https://YOUR_SERVICE_URL/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "database": "connected",
  "environment": "production"
}
```

### 2. API Test
```bash
curl https://YOUR_SERVICE_URL/api/test
```

### 3. Frontend
Visit your Cloud Run service URL in a browser to test the React application.

## 📊 Cloud Run Configuration

### Service Configuration
- **Memory**: 1 GiB (can be adjusted based on usage)
- **CPU**: 1 vCPU (can be scaled up if needed)
- **Max Instances**: 10 (prevents runaway costs)
- **Timeout**: 300 seconds (5 minutes)
- **Port**: 8080 (required for Cloud Run)

### Scaling
- **Min Instances**: 0 (scales to zero when not in use)
- **Max Instances**: 10 (can be increased for high traffic)
- **Concurrency**: 80 (requests per instance)

## 💰 Cost Optimization

### Free Tier
Cloud Run provides:
- 2 million requests per month
- 400,000 GB-seconds of memory
- 200,000 vCPU-seconds

### Cost Factors
- **Requests**: $0.40 per million requests
- **Memory**: $0.0000025 per GB-second
- **CPU**: $0.0000100 per vCPU-second
- **Networking**: Egress charges apply

### Optimization Tips
1. **Scale to Zero**: Service scales to 0 when not in use
2. **Right-size Resources**: Start with 1 GiB memory, 1 vCPU
3. **Set Max Instances**: Prevent unexpected scaling costs
4. **Use CDN**: For static assets (already configured)

## 🔒 Security Best Practices

### Container Security
- ✅ Non-root user in Docker container
- ✅ Minimal base image (Alpine Linux)
- ✅ Security headers with Helmet.js
- ✅ Environment variables for secrets

### Network Security
- ✅ HTTPS by default
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation

### Access Control
- ✅ IAM roles for service accounts
- ✅ Least privilege principle
- ✅ Audit logging enabled

## 📈 Monitoring and Logging

### Cloud Logging
View logs in Google Cloud Console:
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=classroom-assignment" --limit 50
```

### Cloud Monitoring
- Set up alerts for error rates
- Monitor response times
- Track resource usage

### Health Checks
The application includes:
- Docker health check
- `/api/health` endpoint
- Database connection monitoring

## 🔄 CI/CD with Cloud Build

### Automatic Deployment
The included `cloudbuild.yaml` enables automatic deployment:

1. **Connect Repository**: Link your Git repository to Cloud Build
2. **Create Trigger**: Set up build triggers for main branch
3. **Automatic Builds**: Every push triggers a new deployment

### Manual Build
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 🌐 Custom Domain

### Add Custom Domain
1. Go to Cloud Run console
2. Select your service
3. Click "Manage Custom Domains"
4. Add your domain and verify ownership
5. Update DNS records as instructed

### SSL Certificate
- Automatic SSL certificate provisioning
- Managed by Google Cloud
- Auto-renewal included

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
gcloud builds log BUILD_ID

# Common fixes:
# - Ensure Dockerfile is correct
# - Check .dockerignore
# - Verify all dependencies are listed
```

#### 2. Service Not Starting
```bash
# Check service logs
gcloud logs read "resource.type=cloud_run_revision" --limit 50

# Common fixes:
# - Verify PORT=8080 environment variable
# - Check server listens on 0.0.0.0
# - Ensure graceful shutdown handling
```

#### 3. Database Connection Issues
```bash
# Test MongoDB connection
# - Verify MONGODB_URI is correct
# - Check MongoDB Atlas network access
# - Ensure database user permissions
```

#### 4. Email Service Issues
```bash
# Check email configuration
# - Verify Gmail App Password
# - Test email service locally first
# - Check environment variables
```

## 📋 Deployment Checklist

Before going live:
- [ ] Google Cloud project created and billing enabled
- [ ] All required APIs enabled
- [ ] Environment variables configured
- [ ] MongoDB Atlas network access configured
- [ ] Email service tested
- [ ] Health check endpoint working
- [ ] Frontend loads correctly
- [ ] User registration and login tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up

## 🎉 Success!

Your Classroom Assignment Portal is now deployed on Google Cloud Run with:
- ✅ Automatic scaling
- ✅ HTTPS by default
- ✅ Global CDN
- ✅ 99.95% SLA
- ✅ Pay-per-use pricing
- ✅ Zero server management

Your application is production-ready and can handle traffic from students and teachers worldwide!