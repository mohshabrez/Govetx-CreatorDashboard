// Simple build script to handle Netlify builds

console.log('Starting client build process...');

// Import necessary modules
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run shell commands and log output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.stdout?.toString() || error.message);
    throw error;
  }
}

// Create a valid package.json if not exists
console.log('Checking package.json...');
try {
  const packageJson = require('./package.json');
  console.log('Package.json found:', packageJson.name, packageJson.version);
} catch (error) {
  console.error('Error loading package.json:', error.message);
  process.exit(1);
}

// Display environment information
console.log('Node version:', process.version);
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  VITE_API_URL: process.env.VITE_API_URL || 'Not set'
});

// Check for Typescript config
if (!fs.existsSync('./tsconfig.json')) {
  console.log('Creating tsconfig.json...');
  fs.writeFileSync('./tsconfig.json', JSON.stringify({
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"],
        "@shared/*": ["../shared/*"]
      }
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }, null, 2));
}

// Ensure we have a proper vite.config.ts
if (!fs.existsSync('./vite.config.ts')) {
  console.log('Creating vite.config.ts...');
  fs.writeFileSync('./vite.config.ts', `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
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
  `.trim());
}

// Remove any problematic dependencies
try {
  runCommand('npm uninstall @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer || true');
} catch (error) {
  console.log('No Replit plugins to remove');
}

// Run the actual build
try {
  console.log('Starting the build process...');
  runCommand('npm run build');
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 