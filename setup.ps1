# Creator Dashboard Setup Script
# This script helps set up the Creator Dashboard project by installing dependencies

Write-Host "Setting up Creator Dashboard..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js $nodeVersion is installed." -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js v18 or higher before continuing." -ForegroundColor Red
    exit
}

# Install dependencies for the root project
Write-Host "Installing root project dependencies..." -ForegroundColor Cyan
npm install

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
cd client
npm install
cd ..

# Check if .env files exist
Write-Host "Checking for environment files..." -ForegroundColor Cyan

# Server .env file
if (-not (Test-Path "server/.env")) {
    Write-Host "Creating example server/.env file..." -ForegroundColor Yellow
    @"
# Server Environment Variables

# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/creator-dashboard

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Reddit API Credentials
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# Twitter API Credentials
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# CORS Configuration
CLIENT_URL=http://localhost:5173
"@ | Out-File -FilePath "server/.env" -Encoding utf8
    Write-Host "Please update server/.env with your actual credentials." -ForegroundColor Yellow
}

# Client .env file
if (-not (Test-Path "client/.env")) {
    Write-Host "Creating example client/.env file..." -ForegroundColor Yellow
    @"
# Client Environment Variables

# API URL
VITE_API_URL=http://localhost:3000/api

# Authentication
VITE_AUTH_STORAGE_KEY=creator_dashboard_auth

# Feature Flags
VITE_ENABLE_TWITTER_FEED=true
VITE_ENABLE_REDDIT_FEED=true
"@ | Out-File -FilePath "client/.env" -Encoding utf8
    Write-Host "Please update client/.env with your actual configuration." -ForegroundColor Yellow
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "To start the application in development mode, run:" -ForegroundColor Cyan
Write-Host "./start-dev.ps1" -ForegroundColor White
Write-Host "or run these commands in separate terminals:" -ForegroundColor Cyan
Write-Host "npm run dev:server:win  # For the server" -ForegroundColor White
Write-Host "npm run dev:client      # For the client" -ForegroundColor White 