# Complete Deployment Guide

This guide provides comprehensive instructions for deploying the Classroom Assignment Portal with all environment variables stored in files.

## Prerequisites

1. Node.js 18+ installed
2. MongoDB database (local or cloud)
3. Vercel CLI installed (`npm i -g vercel`)

## Environment Setup

### 1. Configure Environment Variables

Copy and modify the environment files:

```bash
# Copy production environment template
cp .env.production .env.production.local

# Copy development environment template  
cp .env.development .env.local
```

### 2. Update Production Environment Variables

Edit `.env.production.local` with your actual values:

```env
# Database - Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/classroom-assignment

# Session Secret - Generate a strong random string
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters-long

# Client URL - Your deployed app URL
CLIENT_URL=https://your-app-name.vercel.app

# Email (Optional - for password reset)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Razorpay (Your actual keys)
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Deployment Options

### Option 1: Automated Vercel Deployment

```bash
# Run the automated deployment script
node deploy-vercel.js
```

This script will:
- Build the project
- Set environment variables in Vercel
- Deploy to production

### Option 2: Manual Vercel Deployment

```bash
# Build the project
npm run build

# Login to Vercel (if not already)
vercel login

# Deploy
vercel --prod
```

Then manually set environment variables in Vercel dashboard.

### Option 3: Manual Server Deployment

```bash
# Build the project
node deploy-manual.js
```

Follow the printed instructions for manual deployment.

## Post-Deployment Setup

### 1. Verify Deployment

Visit your deployed URL and check:
- [ ] Landing page loads
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard loads after login
- [ ] API endpoints respond correctly

### 2. Test Core Features

- [ ] User registration with OTP
- [ ] User login/logout
- [ ] Password reset (if email configured)
- [ ] Class creation (teachers)
- [ ] Class joining (students)
- [ ] Assignment creation
- [ ] Payment integration

### 3. Configure Domain (Optional)

If using a custom domain:
1. Add domain in Vercel dashboard
2. Update `CLIENT_URL` in environment variables
3. Redeploy

## Troubleshooting

### Common Issues

#### 1. 404 Errors on Routes

**Problem**: Direct navigation to routes like `/dashboard` returns 404

**Solution**: Ensure your `vercel.json` has proper routing configuration:
```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/index.html"
    }
  ]
}
```

#### 2. API Endpoints Not Working

**Problem**: API calls return 404 or 500 errors

**Solutions**:
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Vercel function logs

#### 3. Session Issues

**Problem**: Users get logged out frequently

**Solutions**:
- Ensure `SESSION_SECRET` is set and consistent
- Check MongoDB connection for session storage
- Verify cookie settings in production

#### 4. CORS Issues

**Problem**: Cross-origin request errors

**Solutions**:
- Ensure `CLIENT_URL` matches your deployed URL
- Check CORS configuration in server.js
- Verify `withCredentials: true` in axios config

### Debug Commands

```bash
# Check Vercel logs
vercel logs

# Test API endpoints
curl https://your-app.vercel.app/api/health

# Check environment variables
vercel env ls
```

## Security Checklist

- [ ] Strong `SESSION_SECRET` (32+ characters)
- [ ] Secure MongoDB connection (authentication enabled)
- [ ] Environment variables not exposed in client code
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Secure cookie settings for production

## Performance Optimization

### 1. Database Optimization

- Use MongoDB Atlas for better performance
- Enable connection pooling
- Add database indexes for frequently queried fields

### 2. Frontend Optimization

- Enable gzip compression
- Optimize images and assets
- Use CDN for static assets (Vercel handles this)

### 3. Backend Optimization

- Implement caching for frequently accessed data
- Optimize database queries
- Use pagination for large datasets

## Monitoring and Maintenance

### 1. Set Up Monitoring

- Monitor Vercel function execution time
- Track database performance
- Set up error logging

### 2. Regular Maintenance

- Update dependencies regularly
- Monitor security vulnerabilities
- Backup database regularly
- Review and rotate secrets periodically

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `SESSION_SECRET` | Session encryption key | Yes | `random-32-char-string` |
| `CLIENT_URL` | Frontend URL | Yes | `https://app.vercel.app` |
| `EMAIL_SERVICE` | Email service provider | No | `gmail` |
| `EMAIL_HOST` | SMTP host | No | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | No | `587` |
| `EMAIL_USER` | Email username | No | `user@gmail.com` |
| `EMAIL_PASS` | Email password | No | `app-password` |
| `RAZORPAY_KEY_ID` | Razorpay public key | Yes | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Yes | `secret-key` |

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Vercel logs for errors
3. Verify all environment variables are set correctly
4. Test locally first with development environment

## Quick Deploy Commands

```bash
# Full automated deployment
npm run deploy:auto

# Manual deployment with build
npm run deploy:manual

# Development server
npm run dev

# Production build only
npm run build
```