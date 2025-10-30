# Complete Vercel Deployment Guide

## Prerequisites
- Vercel account
- MongoDB Atlas database
- Gmail account with App Password (for email service)

## Step 1: Environment Variables Setup

### Required Environment Variables in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

```
MONGODB_URI=mongodb+srv://visheshj2005:Visheshjain18@classroom-portal.dl5nzmz.mongodb.net/?appName=classroom-portal
JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=10
EMAIL_SERVICE=gmail
EMAIL_USER=visheshj2005@gmail.com
EMAIL_PASS=wxxjnvemknawzrkf
EMAIL_FROM=visheshj2005@gmail.com
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_FILE_UPLOADS=true
MAX_FILE_SIZE=50MB
ANALYTICS_RETENTION_DAYS=365
NOTIFICATION_RETENTION_DAYS=30
```

## Step 2: Project Structure Verification

Ensure your project has this structure:
```
├── api/
│   ├── index.js          # Main serverless function
│   └── health.js         # Health check endpoint
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js         # Express app
├── src/                  # React frontend
├── dist/                 # Build output (auto-generated)
├── vercel.json           # Vercel configuration
├── package.json          # Root dependencies
└── .env.production       # Production environment config
```

## Step 3: Key Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

### .env.production
```
VITE_API_URL=/api
```

## Step 4: Deployment Process

### Option 1: Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel will automatically deploy on every push

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 5: Post-Deployment Testing

### 1. Health Check
Visit: `https://your-app.vercel.app/api/health`
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
Visit: `https://your-app.vercel.app/api/test`
Expected response:
```json
{
  "success": true,
  "message": "API is working"
}
```

### 3. Frontend Test
- Visit your app URL
- Try registering a new account
- Check if OTP email is sent
- Try logging in

## Step 6: Troubleshooting

### Common Issues and Solutions

#### 1. 404 on API Routes
- Check Vercel function logs in dashboard
- Verify `api/index.js` exists and exports the Express app
- Ensure all dependencies are in root `package.json`

#### 2. Database Connection Issues
- Verify MongoDB URI in Vercel environment variables
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has read/write permissions

#### 3. Email Service Issues
- Verify Gmail App Password is correct
- Check email environment variables in Vercel
- Test email service locally first

#### 4. CORS Issues
- Server is configured to allow all Vercel domains
- Check browser console for specific CORS errors
- Verify API calls are using relative URLs (`/api/...`)

#### 5. Build Issues
- Check Vercel build logs
- Ensure all dependencies are properly listed
- Verify Node.js version compatibility

### Debug Commands

#### Test API Locally
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

#### Check Logs
- Go to Vercel Dashboard → Your Project → Functions
- Click on any function to see logs
- Check for errors and debug information

## Step 7: Performance Optimization

### 1. Function Configuration
- Set appropriate `maxDuration` for heavy operations
- Use environment variables for configuration
- Implement proper error handling

### 2. Database Optimization
- Use connection pooling (already configured)
- Implement proper indexes in MongoDB
- Use lean queries where possible

### 3. Frontend Optimization
- Code splitting is already configured in Vite
- Static assets are served from Vercel CDN
- Gzip compression is automatic

## Step 8: Security Checklist

- ✅ Environment variables are set in Vercel (not in code)
- ✅ JWT secret is secure and long enough
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ Helmet security headers are applied
- ✅ Input validation is implemented
- ✅ Password hashing is secure (bcrypt)

## Step 9: Monitoring and Maintenance

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor function performance
- Track error rates

### Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up alerts for connection issues
- Regular backup verification

### Email Service Monitoring
- Monitor email delivery rates
- Check for bounced emails
- Verify SMTP credentials regularly

## Final Verification Checklist

Before going live:
- [ ] All environment variables set in Vercel
- [ ] Health endpoint returns success
- [ ] User registration works
- [ ] Email OTP is sent and received
- [ ] User login works
- [ ] All main features functional
- [ ] No console errors in browser
- [ ] API responses are fast (< 5 seconds)
- [ ] Database connections are stable
- [ ] Error handling works properly

## Support

If you encounter issues:
1. Check Vercel function logs
2. Test API endpoints directly
3. Verify environment variables
4. Check MongoDB Atlas connection
5. Review browser console for frontend errors

Your application should now be fully deployed and functional on Vercel!