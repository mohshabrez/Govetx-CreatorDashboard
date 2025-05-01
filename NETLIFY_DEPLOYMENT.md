# Netlify Deployment Guide for Monolithic App

This guide will help you deploy your monolithic application to Netlify, with the backend hosted separately on Render.

## Prerequisites

- Netlify account
- Render account (or similar service)
- MongoDB Atlas account with an active cluster
- Node.js 18+ installed locally

## Steps for Deployment

### 1. Deploy the Backend to Render

1. Sign up for Render at https://render.com (or use another backend hosting service like Railway or Heroku)

2. Connect your GitHub repository to Render

3. Deploy a new "Web Service" with these settings:
   - Build Command: `npm install && npm run build:server`
   - Start Command: `npm run start:server`
   - Environment Variables:
     - `NODE_ENV`: `production`
     - `PORT`: `8080` (Render will expose this as `PORT`)
     - `ALLOWED_ORIGINS`: `https://your-netlify-url.netlify.app` (your Netlify URL)
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT signing

4. Wait for the deployment to complete and note the URL (e.g., `https://creator-dashboard-api.onrender.com`)

### 2. Update Client Configuration

1. Create the file `client/.env.production` with:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_AUTH_STORAGE_KEY=creator_dashboard_auth
   ```

2. Commit this file to your repository

### 3. Deploy the Frontend to Netlify

#### Option 1: Deploy via Netlify UI

1. Log in to Netlify and click "New site from Git"
2. Connect to your GitHub repository
3. Configure build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click "Deploy site"

#### Option 2: Deploy via Command Line

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run the deployment script: `bash ./deploy-netlify.sh`
3. Follow the prompts to complete the deployment

### 4. Link Your Custom Domain (Optional)

1. In the Netlify dashboard, go to "Domain settings"
2. Add your custom domain and follow the DNS configuration instructions

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Check that `ALLOWED_ORIGINS` on the backend includes your Netlify domain
2. Verify the Content-Security-Policy header in `netlify.toml` allows connections to your backend
3. Test your API endpoints using tools like Postman to verify they work directly

### MongoDB Connection Issues

1. Ensure your MongoDB Atlas cluster is configured to accept connections from anywhere (or from Render's IP range)
2. Check that your MongoDB connection string is correct in the Render environment variables
3. Verify your database user has the correct permissions

### Build Failures

1. Check the build logs in Netlify or Render for specific errors
2. Verify your build commands work locally before deploying
3. Ensure all dependencies are correctly listed in package.json

## Monitoring and Maintenance

- Use the Netlify and Render dashboards to monitor your application
- Set up MongoDB Atlas alerts for database performance issues
- Consider implementing error tracking with services like Sentry 