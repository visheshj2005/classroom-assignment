# Render Environment Variables Setup

## Required Environment Variables for Render

Set these in your Render dashboard under "Environment Variables":

### Database & Core
```
MONGODB_URI=mongodb+srv://visheshj2005:Visheshjain18@classroom-portal.dl5nzmz.mongodb.net/?appName=classroom-portal
NODE_ENV=production
PORT=10000
```

### Security & Sessions
```
JWT_SECRET=your-super-secret-jwt-key-for-production-minimum-32-characters-long-change-this-in-production
SESSION_SECRET=your-super-secret-session-key-for-production-change-this-minimum-32-characters
```

### Frontend URLs
```
CLIENT_URL=https://classroom-assignment-pqcj.vercel.app
FRONTEND_URL=https://classroom-assignment-pqcj.vercel.app
CORS_ORIGIN=https://classroom-assignment-pqcj.vercel.app
```

### Email Configuration
```
EMAIL_SERVICE=gmail
EMAIL_USER=visheshj2005@gmail.com
EMAIL_PASS=wxxjnvemknawzrkf
EMAIL_FROM=visheshj2005@gmail.com
```

### Optional Configuration
```
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

## Render Service Configuration

### Build Settings
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Service Settings
- **Environment**: Node
- **Region**: Oregon (or closest to your users)
- **Plan**: Free (or paid for better performance)

## Deployment Steps

1. **Push to GitHub**: Make sure all changes are committed and pushed
2. **Create Render Service**: Connect your GitHub repo
3. **Configure Build**: Set root directory to `server`
4. **Set Environment Variables**: Copy all variables above
5. **Deploy**: Render will automatically deploy
6. **Test**: Use `npm run test:quick` to verify

## Troubleshooting

### If deployment fails:
1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB Atlas allows Render IPs
4. Check that your GitHub repo is up to date

### If login fails:
1. Verify CORS_ORIGIN includes your Vercel URL
2. Check SESSION_SECRET is set
3. Ensure database connection is working
4. Test with correct user credentials

## Testing Commands

```bash
# Test the deployment
npm run test:quick

# Full deployment test
npm run test:deployment

# Test specific login
node quick-deployment-fix.js
```

## Expected URLs

- **Frontend**: https://classroom-assignment-pqcj.vercel.app
- **Backend**: https://classroom-assignment-50uu.onrender.com
- **API Endpoint**: https://classroom-assignment-50uu.onrender.com/api

Your frontend will make API calls to the Render backend URL, not the Vercel URL.