# Deployment Guide - Classroom Assignment Portal

This guide will help you deploy the Classroom Assignment Portal to production using Vercel, MongoDB Atlas, and AWS S3.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account** - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **AWS Account** - Sign up at [aws.amazon.com](https://aws.amazon.com)
4. **Git Repository** - Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: MongoDB Atlas Setup

1. **Create a Cluster:**
   - Log into MongoDB Atlas
   - Create a new cluster (free tier is sufficient for testing)
   - Choose a cloud provider and region

2. **Configure Database Access:**
   - Go to "Database Access" in the left sidebar
   - Add a new database user with read/write permissions
   - Note down the username and password

3. **Configure Network Access:**
   - Go to "Network Access" in the left sidebar
   - Add IP address `0.0.0.0/0` (allows access from anywhere - for production, restrict this)

4. **Get Connection String:**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

## Step 2: AWS S3 Setup

1. **Create S3 Bucket:**
   - Log into AWS Console
   - Go to S3 service
   - Create a new bucket with a unique name
   - Choose a region (preferably same as your Vercel deployment)
   - Keep default settings for now

2. **Configure Bucket Permissions:**
   - Go to your bucket's "Permissions" tab
   - Update CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User:**
   - Go to IAM service in AWS Console
   - Create a new user with programmatic access
   - Attach the following policy (replace `your-bucket-name`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
   - Note down the Access Key ID and Secret Access Key

## Step 3: Vercel Deployment

1. **Connect Repository:**
   - Log into Vercel
   - Click "New Project"
   - Import your Git repository

2. **Configure Environment Variables:**
   In Vercel dashboard, go to your project settings and add these environment variables:

   ```
   # Database (REQUIRED)
   MONGODB_URI=mongodb+srv://visheshj2005:Visheshjain18@classroom-portal.dl5nzmz.mongodb.net/?appName=classroom-portal

   # JWT (REQUIRED)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
   JWT_EXPIRES_IN=7d

   # Server Configuration (REQUIRED)
   NODE_ENV=production

   # Security Settings
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=200
   AUTH_RATE_LIMIT_MAX=10

   # Feature Flags (Optional)
   ENABLE_ANALYTICS=true
   ENABLE_NOTIFICATIONS=true
   ENABLE_FILE_UPLOADS=true
   ```

   **Note:** AWS S3 configuration is no longer required as the app now uses database storage for files.

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## Step 4: Post-Deployment Setup

1. **Create Admin User:**
   - SSH into your deployment or use Vercel's function logs
   - Run the admin creation script:
   ```bash
   node generate-admin-hash.js
   ```
   - Or create an admin user through the API

2. **Test File Uploads:**
   - Log into your deployed application
   - Try uploading a file to ensure S3 integration works

3. **Configure Domain (Optional):**
   - In Vercel dashboard, go to your project settings
   - Add a custom domain if desired

## Environment Variables Reference

### Required for Production:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure random string (minimum 32 characters)
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `AWS_S3_BUCKET` - Your S3 bucket name
- `CLIENT_URL` - Your Vercel app URL

### Optional:
- `AWS_REGION` - AWS region (default: us-east-1)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)
- `JWT_EXPIRES_IN` - JWT expiration time (default: 7d)

## Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Verify MongoDB Atlas connection string
   - Check network access settings in Atlas
   - Ensure database user has correct permissions

2. **File Upload Errors:**
   - Verify AWS credentials are correct
   - Check S3 bucket permissions
   - Ensure bucket name is unique and accessible

3. **Build Errors:**
   - Check Vercel build logs
   - Ensure all dependencies are listed in package.json
   - Verify environment variables are set correctly

4. **CORS Errors:**
   - Update `CLIENT_URL` environment variable
   - Check S3 CORS configuration

### Getting Help:

- Check Vercel deployment logs
- Monitor MongoDB Atlas metrics
- Review AWS CloudWatch logs for S3 operations

## Security Considerations

1. **Environment Variables:**
   - Never commit sensitive data to Git
   - Use strong, unique passwords and secrets
   - Rotate credentials regularly

2. **Database Security:**
   - Restrict MongoDB Atlas network access to specific IPs in production
   - Use strong database passwords
   - Enable database auditing

3. **S3 Security:**
   - Use IAM policies with minimal required permissions
   - Enable S3 bucket logging
   - Consider enabling S3 encryption

4. **Application Security:**
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Implement rate limiting (already included)

## Monitoring and Maintenance

1. **Set up monitoring:**
   - Use Vercel Analytics
   - Monitor MongoDB Atlas metrics
   - Set up AWS CloudWatch alerts

2. **Regular maintenance:**
   - Update dependencies
   - Monitor disk usage
   - Review access logs

3. **Backup strategy:**
   - MongoDB Atlas provides automatic backups
   - Consider additional backup strategies for critical data

## Success Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] AWS S3 bucket created with proper permissions
- [ ] Vercel project deployed successfully
- [ ] Environment variables configured
- [ ] Admin user created
- [ ] File upload functionality tested
- [ ] User registration and login working
- [ ] All main features accessible

Your Classroom Assignment Portal should now be fully deployed and ready for use!