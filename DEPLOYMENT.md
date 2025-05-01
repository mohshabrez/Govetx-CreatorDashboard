# Deployment Guide

This guide will help you deploy the Creator Dashboard application using:
- Google Cloud Platform (GCP) for the backend server
- Netlify for the frontend client
- MongoDB Atlas for the database

## Prerequisites

- Google Cloud Platform account
- Netlify account
- MongoDB Atlas account (already set up)
- Google Cloud CLI installed (`gcloud`)
- Netlify CLI installed (`netlify-cli`)
- Git repository for your project

## 1. MongoDB Atlas Configuration

For detailed MongoDB Atlas setup instructions, see [MONGODB_SETUP.md](MONGODB_SETUP.md).

In summary:
1. Create a MongoDB Atlas cluster (free tier is sufficient to start)
2. Set up a database user with appropriate permissions
3. Configure network access to allow connections from your deployment environments
4. Get your MongoDB connection string

## 2. Backend Deployment to Google Cloud Run

Google Cloud Run is an excellent choice for deploying containerized applications that can scale automatically.

### 2.1 Prepare Your Backend

1. Create a `Dockerfile` in your project root:

```bash
cd /path/to/creator-dashboard
```

Create a file named `Dockerfile` with the following content:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY drizzle.config.ts ./

# Copy server directory
COPY server ./server

# Install dependencies
RUN npm install

# Build the application
RUN npm run build:server

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:server"]
```

2. Update `package.json` to add build and start scripts for the server:

```json
"scripts": {
  "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start:server": "NODE_ENV=production node dist/index.js",
  // ... other scripts
}
```

3. Create a `.gcloudignore` file:
```
node_modules/
client/
.git/
.gitignore
```

### 2.2 Deploy to Google Cloud Run

1. Initialize gcloud and set your project:

```bash
gcloud init
gcloud config set project YOUR_GCP_PROJECT_ID
```

2. Enable required APIs:

```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

3. Set up secrets for sensitive information:

```bash
# Create secrets for your environment variables
echo -n "your_mongodb_uri" | gcloud secrets create mongodb-uri --data-file=-
echo -n "your_jwt_secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your_reddit_client_id" | gcloud secrets create reddit-client-id --data-file=-
echo -n "your_reddit_client_secret" | gcloud secrets create reddit-client-secret --data-file=-
echo -n "your_twitter_api_key" | gcloud secrets create twitter-api-key --data-file=-
echo -n "your_twitter_api_secret" | gcloud secrets create twitter-api-secret --data-file=-
echo -n "your_twitter_bearer_token" | gcloud secrets create twitter-bearer-token --data-file=-

# Grant the Cloud Run service account access to these secrets
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Repeat for each secret
```

4. Build and deploy to Cloud Run:

```bash
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/creator-dashboard-server
gcloud run deploy creator-dashboard-server \
  --image gcr.io/YOUR_GCP_PROJECT_ID/creator-dashboard-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars="NODE_ENV=production,PORT=8080,CLIENT_URL=YOUR_NETLIFY_URL" \
  --set-secrets="MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest,REDDIT_CLIENT_ID=reddit-client-id:latest,REDDIT_CLIENT_SECRET=reddit-client-secret:latest,TWITTER_API_KEY=twitter-api-key:latest,TWITTER_API_SECRET=twitter-api-secret:latest,TWITTER_BEARER_TOKEN=twitter-bearer-token:latest"
```

5. Note the service URL provided after deployment (e.g., `https://creator-dashboard-server-xyz123.run.app`)

## 3. Frontend Deployment to Netlify

Netlify is excellent for hosting static sites and React applications with continuous deployment.

### 3.1 Prepare Your Frontend

1. Create a `netlify.toml` file in your project root:

```toml
[build]
  base = "client/"
  publish = "dist/"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Update the client `.env` for production:

Create a `.env.production` file in the client directory:

```
VITE_API_URL=https://your-cloud-run-service-url.run.app/api
VITE_AUTH_STORAGE_KEY=creator_dashboard_auth
VITE_ENABLE_TWITTER_FEED=true
VITE_ENABLE_REDDIT_FEED=true
```

3. Ensure your client's build script is configured in `client/package.json`:

```json
"scripts": {
  "build": "vite build",
  // ... other scripts
}
```

### 3.2 Deploy to Netlify

#### Option 1: Deploy via Netlify CLI

1. Login to Netlify:

```bash
netlify login
```

2. Initialize Netlify in your project:

```bash
netlify init
```

3. Deploy to Netlify:

```bash
cd client
npm run build
netlify deploy --prod
```

#### Option 2: Deploy via Netlify UI

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)

2. Login to Netlify and click "New site from Git"

3. Select your repository and configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `client`

4. Add environment variables in the Netlify UI (Settings > Build & deploy > Environment):
   - `VITE_API_URL`=https://your-cloud-run-service-url.run.app/api
   - `VITE_AUTH_STORAGE_KEY`=creator_dashboard_auth
   - `VITE_ENABLE_TWITTER_FEED`=true
   - `VITE_ENABLE_REDDIT_FEED`=true

5. Deploy the site

## 4. Configure CORS

Update your server's CORS configuration with the Netlify domain:

1. Edit `server/index.ts` to ensure CORS is properly configured:

```typescript
// In your server code
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://your-netlify-app.netlify.app',
  credentials: true
}));
```

2. Redeploy the server after making this change

## 5. Domain Setup (Optional)

### For Netlify:
1. Go to Netlify dashboard > your site > Domain settings > Add custom domain

### For Google Cloud Run:
1. Set up a domain mapping in Google Cloud Console
2. Configure the domain with your DNS provider

## 6. Continuous Deployment

### For Netlify:
- Automatic deployments occur when you push to your repository

### For Google Cloud Run:
1. Set up Cloud Build trigger:
```bash
gcloud builds triggers create github \
  --repo-name=YOUR_REPO_NAME \
  --branch-pattern=main \
  --build-config=cloudbuild.yaml
```

2. Create a `cloudbuild.yaml` file in your project root:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/creator-dashboard-server', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/creator-dashboard-server']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'creator-dashboard-server'
      - '--image'
      - 'gcr.io/$PROJECT_ID/creator-dashboard-server'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

## 7. Monitoring & Debugging

### Google Cloud Run:
- View logs in Google Cloud Console > Cloud Run > creator-dashboard-server > Logs

### Netlify:
- View deploy logs in Netlify dashboard > your site > Deploys
- Configure monitoring alerts in Settings > Build & deploy > Deploy notifications

## 8. Cost Management

### Google Cloud Run:
- Only pay for actual usage (requests/compute time)
- Set budget alerts in Google Cloud Console

### Netlify:
- Free tier includes 300 build minutes/month
- Monitor usage in Netlify dashboard > your site > Settings > General > Site details

## 9. Security Considerations

1. Use secrets for storing sensitive information
2. Configure appropriate IAM permissions
3. Set up firewall rules if needed
4. Consider implementing rate limiting for API endpoints
5. Use HTTPS for all communications
6. Implement proper authentication and authorization

## 10. Troubleshooting

### Common Google Cloud Run Issues:
- Container fails to start: Check logs for startup errors
- Unable to connect to MongoDB: Verify network access settings
- Timeout errors: Adjust container memory and CPU settings

### Common Netlify Issues:
- Build failures: Check build logs for errors
- API connectivity issues: Verify CORS configuration
- Environment variables not working: Check variable names and ensure they're properly set 