# Vercel Deployment Fix Guide

## Issue
Getting 404 errors on login/signup pages after Vercel deployment.

## Root Cause
The frontend was using hardcoded localhost API URLs that don't work in production.

## Fixes Applied

### 1. Frontend API URL Configuration
- Updated `src/contexts/AuthContext.jsx` to use relative `/api` path in production
- Created `.env.production` file with correct API URL
- Frontend now automatically detects production vs development environment

### 2. Server CORS Configuration
- Updated CORS settings to allow Vercel domains
- Added more permissive origin checking for deployment

### 3. Environment Variables Setup

#### Required Vercel Environment Variables
Set these in your Vercel dashboard (Settings > Environment Variables):

```
MONGODB_URI=mongodb+srv://visheshj2005:Visheshjain18@classroom-portal.dl5nzmz.mongodb.net/?appName=classroom-portal
JWT_SECRET=your-super-secret-jwt-key-for-local-development-minimum-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
AUTH_RATE_LIMIT_MAX=10
```

### 4. Testing the Deployment

#### Test API Health
Visit: `https://your-vercel-app.vercel.app/api/health`
Should return server status and database connection info.

#### Test API Endpoints
Visit: `https://your-vercel-app.vercel.app/api/test`
Should return API working confirmation.

#### Test Authentication
The login/register forms should now work properly.

## Deployment Steps

1. **Set Environment Variables in Vercel**
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all the variables listed above

2. **Redeploy**
   ```bash
   npm run deploy
   ```
   Or push to your connected Git repository.

3. **Verify**
   - Test the health endpoint
   - Try logging in/registering
   - Check browser network tab for API calls

## Troubleshooting

### If still getting 404s:
1. Check Vercel function logs in dashboard
2. Verify environment variables are set
3. Test API endpoints directly
4. Check browser console for CORS errors

### If database connection fails:
1. Verify MongoDB URI is correct
2. Check MongoDB Atlas network access settings
3. Ensure database user has proper permissions

### Test Script
Run locally to test your deployed API:
```bash
node test-vercel-api.js https://your-vercel-app.vercel.app
```

## Files Modified
- `src/contexts/AuthContext.jsx` - Fixed API URL detection
- `server/server.js` - Updated CORS configuration
- `.env.production` - Added production environment config
- `VERCEL-DEPLOYMENT-FIX.md` - This guide