# Deploy Backend to Render.com

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. The server code is in the `server/` directory
3. Environment variables are configured

## Step 2: Create Render Service

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

### Build & Deploy Settings:
- **Name**: `classroom-assignment-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Environment Variables:
Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret_key
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-vercel-app.vercel.app
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM=your_from_email
```

## Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your backend
3. Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`

## Step 4: Update Frontend Configuration

Update your `.env.vercel` file with the Render backend URL:

```
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

Then redeploy your frontend to Vercel.

## Step 5: Test the Connection

Your app should now work with:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas (or your MongoDB instance)

## Important Notes:

1. **Free Tier Limitations**: Render free tier spins down after 15 minutes of inactivity
2. **CORS Configuration**: Make sure your backend allows requests from your Vercel domain
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Database**: Ensure your MongoDB instance allows connections from Render's IP ranges