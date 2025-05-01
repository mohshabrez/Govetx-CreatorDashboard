#!/bin/bash
set -e  # Exit on error

echo "Starting Netlify build..."

# Display environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install --no-optional

# Remove optional dependencies that might cause issues
echo "Removing problematic dependencies..."
npm uninstall @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer || true

# Create a non-problematic vite config if it doesn't exist
if [ ! -f "vite.config.ts" ]; then
  echo "Creating vite.config.ts..."
  cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
EOF
fi

# Run build
echo "Building client application..."
npm run build

echo "Build completed successfully!" 