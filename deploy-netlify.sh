#!/bin/bash

# Netlify deployment script

echo "Building client for production..."
cd client
npm install
npm run build

echo "Deploying to Netlify..."
npx netlify-cli deploy --prod --dir=dist

echo "Deployment complete!" 