# OTP Functionality Setup Guide

## Current Status
The OTP functionality is implemented but uses a mock email service that only logs to console. To make it work in production, you need to implement actual email sending.

## Quick Setup Options

### Option A: Nodemailer with Gmail (Easiest for testing)

1. **Install nodemailer**:
   ```bash
   cd server && npm install nodemailer
   ```

2. **Add environment variables** to `server/.env`:
   ```env
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-gmail@gmail.com
   ```

3. **Get Gmail App Password**:
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Generate an "App Password" for this application
   - Use the app password (not your regular password)

### Option B: SendGrid (Recommended for production)

1. **Install SendGrid**:
   ```bash
   cd server && npm install @sendgrid/mail
   ```

2. **Add environment variables**:
   ```env
   # Email Configuration
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-sendgrid-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### Option C: AWS SES (Enterprise solution)

1. **Install AWS SDK**:
   ```bash
   cd server && npm install @aws-sdk/client-ses
   ```

2. **Add environment variables**:
   ```env
   # Email Configuration
   EMAIL_SERVICE=aws-ses
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   EMAIL_FROM=noreply@yourdomain.com
   ```
## S
tep-by-Step Setup

### 1. Run the setup script:
```bash
npm run setup-email
```

### 2. Choose and configure your email service:

#### For Gmail (Easiest):
1. Install nodemailer: `cd server && npm install nodemailer`
2. Edit `server/.env` and uncomment Gmail section:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-gmail@gmail.com
   ```
3. Get Gmail App Password:
   - Go to Google Account → Security
   - Enable 2-factor authentication
   - Generate App Password for "Mail"
   - Use the 16-character app password

#### For SendGrid (Production):
1. Install SendGrid: `cd server && npm install @sendgrid/mail`
2. Sign up at sendgrid.com and get API key
3. Edit `server/.env`:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your-api-key
   EMAIL_FROM=noreply@yourdomain.com
   ```

### 3. Test the setup:
```bash
npm run dev
```

### 4. Test OTP registration:
- Go to registration page
- Enter email and other details
- Click "Send OTP"
- Check your email for the OTP code

## Current Status
- ✅ OTP generation and validation working
- ✅ Frontend OTP verification flow complete
- ✅ Mock email service (logs to console)
- ⏳ Real email sending (needs configuration)

## Troubleshooting

### OTP not received:
1. Check server console for email logs
2. Verify email service configuration
3. Check spam folder
4. Ensure email service credentials are correct

### Gmail issues:
- Use App Password, not regular password
- Enable 2-factor authentication first
- Check "Less secure app access" if needed

### SendGrid issues:
- Verify API key is correct
- Check sender verification in SendGrid dashboard
- Ensure domain is verified for production