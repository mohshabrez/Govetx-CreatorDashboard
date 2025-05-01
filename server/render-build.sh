#!/usr/bin/env bash
# exit on error
set -o errexit

# Install all dependencies including dev dependencies
npm install --include=dev

# Set the environment to production during build
export NODE_ENV=production

# Run the specialized build command for Render
npm run render-build 