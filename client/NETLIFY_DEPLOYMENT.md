# Deploying to Netlify

Follow these steps to deploy the client to Netlify:

## Option 1: Using the Netlify UI

1. Sign up or log in to [Netlify](https://netlify.com)

2. Click "Add new site" > "Import an existing project"

3. Connect to your GitHub repository

4. Configure build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

5. Add the environment variable:
   - Key: `VITE_API_URL`
   - Value: Your Render backend URL (e.g., `https://creator-dashboard-api.onrender.com`)

6. Click "Deploy site"

## Option 2: Using the Netlify CLI

1. Install the Netlify CLI if you haven't already:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```bash
   netlify login
   ```

3. Navigate to the client directory:
   ```bash
   cd client
   ```

4. Copy env.sample to .env and update the VITE_API_URL

5. Build the project:
   ```bash
   npm run build
   ```

6. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

7. When prompted, select:
   - Create & configure a new site
   - Select your team
   - Enter a site name (optional)
   - For publish directory, enter: `dist`

## Environment Variables

Don't forget to set up the environment variable in your Netlify deployment settings:

- `VITE_API_URL`: The URL of your Render backend API

This ensures your frontend can communicate with your backend. 