# Ngrok Hybrid Deployment Guide

This guide helps you set up a hybrid deployment where:
- **Frontend**: Hosted on Vercel (fast, global CDN)
- **Backend**: Running locally with ngrok tunnel (easy development/testing)

## Current Configuration

- **Frontend URL**: https://classroom-assignment-pqcj.vercel.app
- **Backend URL**: https://paronymous-jacki-gelatinously.ngrok-free.dev
- **Database**: MongoDB Atlas (cloud)

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Windows
npm run deploy:ngrok-win

# Linux/Mac
npm run deploy:ngrok
```

### Option 2: Manual Setup

1. **Start Backend Server**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start Ngrok Tunnel**
   ```bash
   # In another terminal
   ngrok http 5000
   ```

3. **Update Environment Variables**
   ```bash
   # Update .env file
   echo "VITE_API_URL=https://paronymous-jacki-gelatinously.ngrok-free.dev" > .env
   ```

4. **Deploy Frontend**
   ```bash
   npm run build
   vercel --prod
   ```

## Testing Your Setup

```bash
# Test the hybrid deployment
npm run test:ngrok
```

Or manually test:

```bash
# Test backend health
curl https://paronymous-jacki-gelatinously.ngrok-free.dev/api/health

# Test frontend
curl https://classroom-assignment-pqcj.vercel.app
```

## Troubleshooting

### Backend Issues

1. **Server not starting**
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Ngrok tunnel not working**
   ```bash
   # Make sure ngrok is installed
   ngrok --version
   
   # Start tunnel
   ngrok http 5000
   ```

3. **Database connection issues**
   - Check MongoDB Atlas connection string in `server/.env`
   - Ensure IP whitelist includes your current IP

### Frontend Issues

1. **Build failures**
   ```bash
   # Clear cache and rebuild
   rm -rf dist node_modules
   npm install
   npm run build
   ```

2. **Vercel deployment issues**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel --prod
   ```

### CORS Issues

1. **Cross-origin errors**
   - The server is configured to allow Vercel and ngrok domains
   - If you get CORS errors, check the browser console for specific details

2. **Ngrok browser warning**
   - The app includes `ngrok-skip-browser-warning` header to bypass warnings
   - You can also visit the ngrok URL directly first to accept the warning

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://paronymous-jacki-gelatinously.ngrok-free.dev
```

### Backend (server/.env)
```
CLIENT_URL=https://classroom-assignment-pqcj.vercel.app
FRONTEND_URL=https://classroom-assignment-pqcj.vercel.app
CORS_ORIGIN=https://classroom-assignment-pqcj.vercel.app,http://localhost:5173
```

### Vercel Environment Variables
Set in Vercel dashboard or via CLI:
```
VITE_API_URL=https://paronymous-jacki-gelatinously.ngrok-free.dev
```

## Benefits of This Setup

✅ **Fast Frontend**: Vercel's global CDN for optimal performance  
✅ **Easy Backend Development**: Local server with instant changes  
✅ **Real Database**: Production MongoDB Atlas database  
✅ **HTTPS Everywhere**: Both frontend and backend use HTTPS  
✅ **No Server Costs**: Backend runs locally, frontend on Vercel free tier  

## Limitations

⚠️ **Ngrok URL Changes**: Free ngrok URLs change when restarted  
⚠️ **Local Dependency**: Backend must be running locally  
⚠️ **Network Dependency**: Requires stable internet for ngrok tunnel  

## Next Steps

1. **Custom Domain**: Add custom domain to Vercel for professional URL
2. **Persistent Ngrok**: Upgrade to ngrok paid plan for persistent URLs
3. **Production Backend**: Eventually deploy backend to Render/Railway/etc.

## Support

If you encounter issues:
1. Run `npm run test:ngrok` to diagnose problems
2. Check the troubleshooting section above
3. Verify all environment variables are set correctly