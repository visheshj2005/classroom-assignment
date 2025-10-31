# 🚀 Google Cloud Run - Quick Start Guide

## Prerequisites
1. Google Cloud account with billing enabled
2. Google Cloud SDK installed
3. Docker installed
4. Your project ID ready

## 🎯 Quick Deployment (5 minutes)

### Step 1: Login and Setup
```bash
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your actual project ID)
gcloud config set project YOUR_PROJECT_ID
```

### Step 2: Deploy Application

#### For Linux/Mac:
```bash
# Deploy (replace YOUR_PROJECT_ID with your actual project ID)
./deploy-cloudrun.sh YOUR_PROJECT_ID

# Set environment variables
./set-cloudrun-env.sh YOUR_PROJECT_ID
```

#### For Windows:
```cmd
# Deploy (replace YOUR_PROJECT_ID with your actual project ID)
deploy-cloudrun.bat YOUR_PROJECT_ID

# Set environment variables
set-cloudrun-env.bat YOUR_PROJECT_ID
```

### Step 3: Test Deployment
```bash
# Test your deployment (replace with your actual service URL)
npm run test:cloudrun https://classroom-assignment-xxxxx-uc.a.run.app
```

## 📋 What Gets Deployed

### Infrastructure
- **Container**: Your app in a secure Docker container
- **Scaling**: Automatic scaling from 0 to 10 instances
- **HTTPS**: Automatic SSL certificate
- **CDN**: Global content delivery network
- **Monitoring**: Built-in logging and monitoring

### Configuration
- **Memory**: 1 GiB (adjustable)
- **CPU**: 1 vCPU (adjustable)
- **Port**: 8080 (required for Cloud Run)
- **Timeout**: 300 seconds
- **Region**: us-central1 (changeable)

## 🔧 Environment Variables

The deployment scripts automatically configure these from your `server/.env`:

### Required
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMAIL_SERVICE` - Email service (gmail/sendgrid/aws-ses)
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password/app password
- `EMAIL_FROM` - From email address

### Automatic
- `NODE_ENV=production`
- `PORT=8080`
- `BCRYPT_ROUNDS=12`
- Feature flags and other settings

## 🧪 Testing Your Deployment

After deployment, you'll get a URL like:
`https://classroom-assignment-xxxxx-uc.a.run.app`

### Quick Tests
1. **Health Check**: `https://your-url/api/health`
2. **API Test**: `https://your-url/api/test`
3. **Frontend**: `https://your-url` (should load React app)

### Full Test Suite
```bash
npm run test:cloudrun https://your-service-url
```

## 💰 Cost Estimate

### Free Tier (Monthly)
- 2 million requests
- 400,000 GB-seconds memory
- 200,000 vCPU-seconds

### Typical Usage Cost
For a classroom with 100 students:
- **Estimated cost**: $5-15/month
- **Requests**: ~50,000/month
- **Always-on**: No (scales to zero)

## 🔒 Security Features

### Built-in Security
- ✅ HTTPS by default
- ✅ Container isolation
- ✅ Non-root user
- ✅ Security headers
- ✅ Rate limiting
- ✅ Input validation

### Network Security
- ✅ Google Cloud's global network
- ✅ DDoS protection
- ✅ Automatic security updates

## 📈 Monitoring

### View Logs
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=classroom-assignment" --limit 50
```

### Cloud Console
- Go to Cloud Run in Google Cloud Console
- Click on your service
- View metrics, logs, and configuration

## 🔄 Updates and Redeployment

### Redeploy After Changes
```bash
# Linux/Mac
./deploy-cloudrun.sh YOUR_PROJECT_ID

# Windows
deploy-cloudrun.bat YOUR_PROJECT_ID
```

### Update Environment Variables Only
```bash
# Linux/Mac
./set-cloudrun-env.sh YOUR_PROJECT_ID

# Windows
set-cloudrun-env.bat YOUR_PROJECT_ID
```

## 🌐 Custom Domain (Optional)

1. Go to Cloud Run console
2. Select your service
3. Click "Manage Custom Domains"
4. Add your domain
5. Update DNS records as instructed

## 🆘 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check logs
gcloud logs read "resource.type=cloud_run_revision" --limit 50

# Common fixes:
# - Verify environment variables
# - Check MongoDB connection
# - Ensure port 8080 is used
```

#### Slow Response Times
- First request might be slow (cold start)
- Subsequent requests should be fast
- Consider setting min instances if needed

#### Database Connection Issues
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify connection string
- Ensure database user has proper permissions

## 📞 Support

### Documentation
- Full guide: `GOOGLE-CLOUD-RUN-DEPLOYMENT.md`
- Google Cloud Run docs: https://cloud.google.com/run/docs

### Getting Help
1. Check service logs first
2. Test individual endpoints
3. Verify environment variables
4. Check MongoDB Atlas settings

## 🎉 Success!

Your Classroom Assignment Portal is now running on Google Cloud Run with:
- Global availability
- Automatic scaling
- Enterprise-grade security
- 99.95% uptime SLA
- Pay-per-use pricing

Students and teachers can now access your application from anywhere in the world!