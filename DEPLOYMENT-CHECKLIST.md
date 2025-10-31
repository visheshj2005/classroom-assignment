# Deployment Checklist

## Pre-Deployment

- [ ] Update `.env.production` with actual values
- [ ] Test locally with `npm run dev`
- [ ] Run `npm run build` to ensure build works
- [ ] Verify all environment variables are set

## Environment Variables Setup

### Required Variables
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `SESSION_SECRET` - Strong random string (32+ chars)
- [ ] `CLIENT_URL` - Your deployed app URL
- [ ] `RAZORPAY_KEY_ID` - Razorpay public key
- [ ] `RAZORPAY_KEY_SECRET` - Razorpay secret key

### Optional Variables
- [ ] `EMAIL_SERVICE` - Email service (gmail/mock)
- [ ] `EMAIL_HOST` - SMTP host
- [ ] `EMAIL_PORT` - SMTP port
- [ ] `EMAIL_USER` - Email username
- [ ] `EMAIL_PASS` - Email password

## Deployment Steps

### Automated Deployment
```bash
npm run deploy:auto
```

### Manual Deployment
```bash
npm run deploy:manual
```

## Post-Deployment Verification

### Automated Testing
```bash
npm run verify:deployment https://your-app.vercel.app
```

### Manual Testing
- [ ] Visit landing page
- [ ] Register new account
- [ ] Login with credentials
- [ ] Navigate to dashboard
- [ ] Test forgot password
- [ ] Create a class (teacher)
- [ ] Join a class (student)
- [ ] Test payment flow

## Security Checklist

- [ ] Strong session secret
- [ ] Secure MongoDB connection
- [ ] HTTPS enabled
- [ ] Environment variables not exposed
- [ ] Secure cookie settings

## Performance Checklist

- [ ] Database connection pooling enabled
- [ ] Static assets optimized
- [ ] Gzip compression enabled
- [ ] CDN configured (Vercel handles this)

## Monitoring Setup

- [ ] Error logging configured
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Uptime monitoring

## Backup and Recovery

- [ ] Database backup strategy
- [ ] Environment variables backup
- [ ] Code repository backup
- [ ] Recovery procedures documented

## Final Steps

- [ ] Update documentation
- [ ] Notify team of deployment
- [ ] Monitor for issues
- [ ] Plan next release