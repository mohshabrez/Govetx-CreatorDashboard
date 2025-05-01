#!/bin/bash
set -e  # Exit on error

echo "Starting Render build..."

# Display environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Add extra resolver build step
echo "Building import resolvers..."
cp import-resolver.js dist/
cp import-resolver.d.ts dist/
cp resolve-imports.js dist/
cp resolve-imports.d.ts dist/
cp replit-stub.js dist/
cp vite-stub.js dist/
cp vitejs-stub.js dist/

# Build the application
echo "Building server application..."
npm run build

echo "Build completed successfully!" 