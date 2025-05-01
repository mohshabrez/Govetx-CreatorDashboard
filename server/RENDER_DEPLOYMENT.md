# Deploying to Render

Follow these steps to deploy the server to Render:

1. Sign up or log in to [Render](https://render.com)

2. From your dashboard, click on "New" and select "Blueprint" to deploy using the `render.yaml` configuration file.

3. Connect your GitHub repository when prompted.

4. Configure the required environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret for JWT token generation

5. Click "Create Blueprint" to start the deployment.

6. Once deployed, Render will provide you with a URL for your API (e.g., `https://creator-dashboard-api.onrender.com`).

7. Copy this URL to use as your API endpoint in the client application.

## Manual Deployment

If you prefer to set up manually rather than using the Blueprint:

1. Click "New" and select "Web Service"

2. Connect to your GitHub repository

3. Configure the service with:
   - Name: `creator-dashboard-api`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`

4. Add the environment variables listed above

5. Click "Create Web Service" 