#!/bin/bash
# Creator Dashboard Setup Script
# This script helps set up the Creator Dashboard project by installing dependencies

echo -e "\e[32mSetting up Creator Dashboard...\e[0m"

# Check if Node.js is installed
if command -v node &>/dev/null; then
  nodeVersion=$(node -v)
  echo -e "\e[32mNode.js $nodeVersion is installed.\e[0m"
else
  echo -e "\e[31mNode.js is not installed. Please install Node.js v18 or higher before continuing.\e[0m"
  exit 1
fi

# Install dependencies for the root project
echo -e "\e[36mInstalling root project dependencies...\e[0m"
npm install

# Install client dependencies
echo -e "\e[36mInstalling client dependencies...\e[0m"
cd client
npm install
cd ..

# Check if .env files exist
echo -e "\e[36mChecking for environment files...\e[0m"

# Server .env file
if [ ! -f "server/.env" ]; then
  echo -e "\e[33mCreating example server/.env file...\e[0m"
  cat > server/.env << EOF
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
EOF
  echo -e "\e[33mPlease update server/.env with your actual credentials.\e[0m"
fi

# Client .env file
if [ ! -f "client/.env" ]; then
  echo -e "\e[33mCreating example client/.env file...\e[0m"
  cat > client/.env << EOF
# Client Environment Variables

# API URL
VITE_API_URL=http://localhost:3000/api

# Authentication
VITE_AUTH_STORAGE_KEY=creator_dashboard_auth

# Feature Flags
VITE_ENABLE_TWITTER_FEED=true
VITE_ENABLE_REDDIT_FEED=true
EOF
  echo -e "\e[33mPlease update client/.env with your actual configuration.\e[0m"
fi

# Make the start script executable
chmod +x start-dev.sh

echo -e "\e[32mSetup complete!\e[0m"
echo -e "\e[36mTo start the application in development mode, run:\e[0m"
echo -e "./start-dev.sh"
echo -e "\e[36mor run these commands in separate terminals:\e[0m"
echo -e "npm run dev:server  # For the server"
echo -e "npm run dev:client  # For the client" 