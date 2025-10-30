# Comprehensive Deployment Guide

This document provides a complete guide for deploying the Classroom Assignment Portal to Vercel with all the latest features including OTP verification and extended session management.

## Pre-deployment Checklist

### 1. Environment Variables Setup
Set these environment variables in your Vercel dashboard:

**Required Variables:**
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure JWT secret key (minimum 32 characters)
- `NODE_ENV`: production
- `JWT_EXPIRES_IN`: 30d (for extended sessions)

**Optional Variables:**
- `BCRYPT_ROUNDS`: 12
- `RATE_LIMIT_WINDOW_MS`: 900000
- `RATE_LIMIT_MAX_REQUESTS`: 1000

### 2. Database Setup
Ensure your MongoDB database is accessible from Vercel:
- Use MongoDB Atlas for cloud hosting
- Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for all IPs)
- Test connection string locally first

### 3. Build Configuration

The project includes:
- `vercel.json`: Serverless function configuration
- Updated build scripts in `package.json`
- Production environment configuration

## New Features Implemented

### 1. Extended Session Management (30 days)
- JWT tokens now expire after 30 days instead of 7
- Automatic token validation on app load
- Graceful handling of expired tokens

### 2. OTP Verification for Registration
- Email-based OTP verification during signup
- 6-digit OTP with 10-minute expiration
- Resend functionality with countdown timer
- Mock email service (logs OTP to console in development)

### 3. Fixed Student Dashboard Assignment Status
- Proper submission status tracking
- Shows "Submitted", "Graded", "Not Submitted", or "Overdue"
- Displays grades when available

### 4. Enhanced Teacher Dashboard
- View Class, New Assignment, View Details, Settings buttons
- Correct assignment count display
- Real-time assignment count updates

## Deployment Steps

### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   npm run deploy
   # or manually:
   vercel --prod
   ```

### Method 2: Using GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## Post-deployment Testing

### 1. Frontend Testing
- [ ] Landing page loads correctly
- [ ] Registration with OTP verification works
- [ ] Login/logout functions properly
- [ ] Dashboard displays correctly for all user types
- [ ] Navigation works across all pages

### 2. Backend API Testing
- [ ] `/api/auth/send-otp` endpoint works
- [ ] `/api/auth/register` with OTP verification works
- [ ] `/api/auth/login` endpoint responds
- [ ] Database connections work
- [ ] JWT authentication with 30-day expiration

### 3. Feature Testing
- [ ] User registration with OTP verification
- [ ] Extended session management (30 days)
- [ ] Class creation and management
- [ ] Assignment creation and submission
- [ ] Grading functionality
- [ ] Student dashboard shows correct assignment status

## OTP Service Configuration

### Development
- OTPs are logged to console
- No actual email sending required
- Check server logs for OTP codes

### Production (Future Enhancement)
To implement actual email sending, update `server/services/otpService.js`:

```javascript
// Replace the mock sendOTP method with actual email service
static async sendOTP(email, otp) {
  // Use services like:
  // - Nodemailer with SMTP
  // - SendGrid
  // - AWS SES
  // - Twilio SendGrid
}
```

## Troubleshooting

### Common Issues

1. **OTP Not Received**
   - Check server logs for OTP codes (development)
   - Verify email service configuration (production)
   - Check spam folder

2. **Session Expires Too Quickly**
   - Verify JWT_EXPIRES_IN is set to 30d
   - Check token refresh logic in AuthContext

3. **Assignment Status Not Updating**
   - Clear browser cache
   - Check API responses in network tab
   - Verify submission data structure

### Debug Commands

```bash
# Test API locally
npm run dev

# Check build process
npm run build

# Test production build
npm run preview
```

## Security Considerations

### 1. OTP Security
- 6-digit codes with 10-minute expiration
- Maximum 3 attempts per OTP
- Automatic cleanup of expired OTPs

### 2. Extended Sessions
- 30-day JWT expiration for better UX
- Automatic logout on token expiration
- Secure token storage in localStorage

### 3. Password Security
- Consistent bcrypt hashing (12 rounds)
- Fixed password hashing inconsistency between auth and admin
- Secure password validation

## Performance Optimization

### 1. Session Management
- Extended JWT expiration (30 days)
- Automatic token refresh on API calls
- Graceful handling of expired tokens

### 2. Database Optimization
- Indexed fields for faster queries
- Connection pooling
- Optimized aggregation pipelines

### 3. Frontend Optimization
- Code splitting with React Router
- Lazy loading of components
- Optimized bundle size

## Monitoring and Maintenance

### 1. OTP Monitoring
- Track OTP generation and verification rates
- Monitor failed verification attempts
- Clean up expired OTPs automatically

### 2. Session Monitoring
- Monitor token expiration patterns
- Track authentication failures
- Monitor session duration analytics

### 3. User Experience
- Monitor registration completion rates
- Track login success rates
- Monitor assignment submission patterns

## Support

If you encounter issues:
1. Check Vercel function logs
2. Review environment variable configuration
3. Test API endpoints individually
4. Check database connectivity
5. Review OTP service logs
6. Verify JWT token configuration

## Updates and Maintenance

### Regular Tasks
- Monitor OTP delivery success rates
- Review session duration analytics
- Update dependencies monthly
- Monitor security advisories
- Review and rotate secrets
- Backup database regularly

### Version Control
- Tag releases for easy rollback
- Maintain changelog
- Test deployments in staging first
- Use feature flags for new features