# Frontend (Vercel) + Backend (Render) Deployment Guide

## Current Issue
Your Vercel deployment shows 404 errors on routes like `/login` because you're trying to deploy both frontend and backend together, but Vercel's routing isn't working correctly.

## Solution: Separate Deployments

### Phase 1: Deploy Backend to Render

1. **Create Render Account**: Go to [render.com](https://render.com)

2. **Create Web Service**:
   - Connect your GitHub repo
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret_key
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://classroom-assignment-pqcj.vercel.app
   EMAIL_HOST=your_email_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   EMAIL_FROM=your_from_email
   ```

4. **Deploy**: Render will give you a URL like `https://your-app.onrender.com`

### Phase 2: Update Frontend for Vercel

1. **Update Environment Variables**:
   ```bash
   # In Vercel dashboard, set:
   VITE_API_URL=https://your-render-backend-url.onrender.com/api
   ```

2. **Deploy Frontend**:
   ```bash
   npm run deploy-frontend-vercel.js
   ```

### Phase 3: Test Connection

Your app will now work with:
- **Frontend**: https://classroom-assignment-pqcj.vercel.app (Vercel)
- **Backend**: https://your-app.onrender.com (Render)
- **Database**: MongoDB Atlas

## Quick Fix for Current Vercel Issue

If you want to keep everything on Vercel for now, the issue is likely in the build process. Try:

1. **Check your build output**:
   ```bash
   npm run build
   ```

2. **Verify dist folder** has `index.html` and assets

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

## Files Updated

- ✅ `vercel.json` - Configured for frontend-only deployment
- ✅ `.env.vercel` - Environment variables for Vercel
- ✅ `server/server.js` - Updated CORS for separated deployment
- ✅ `deploy-frontend-vercel.js` - Deployment script for frontend
- ✅ `deploy-backend-render.md` - Instructions for backend deployment

## Next Steps

1. Deploy backend to Render first
2. Get the Render URL
3. Update `.env.vercel` with the Render backend URL
4. Redeploy frontend to Vercel
5. Test the full application

This separation will give you better performance, easier debugging, and more deployment flexibility!