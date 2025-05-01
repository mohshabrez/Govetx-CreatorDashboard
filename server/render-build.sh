#!/usr/bin/env bash
# exit on error
set -o errexit

# Install all dependencies including dev dependencies
npm install --include=dev
npm run build 