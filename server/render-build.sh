#!/usr/bin/env bash
# exit on error
set -o errexit

# Install all dependencies including dev dependencies
npm install --include=dev

# Set the environment to production during build
export NODE_ENV=production

# Make sure all required directories exist
mkdir -p shared
mkdir -p scripts
mkdir -p models
mkdir -p services

# Create Replit stubs
cat > replit-stub.js << 'EOF'
// Stub implementation for @replit/vite-plugin-runtime-error-modal
export default function runtimeErrorModalPlugin() {
  return {
    name: 'runtime-error-modal-stub',
    apply: 'serve',
    configureServer() {},
    transform() { return null; }
  };
}

// Also stub @replit/vite-plugin-cartographer
export function cartographerPlugin() {
  return {
    name: 'cartographer-stub',
    apply: 'serve',
    configureServer() {},
    transform() { return null; }
  };
}
EOF

# Copy models if needed
if [ ! -f "models/user.js" ] && [ -f "models/user.ts" ]; then
  echo "Models directory found"
fi

# Create the production build script if it doesn't exist
if [ ! -f "scripts/build-production.ts" ]; then
  echo "Creating production build script..."
  mkdir -p scripts
  cat > scripts/build-production.ts << 'EOF'
/**
 * This script creates a production build that avoids bundling Vite and other
 * frontend-only dependencies in the server code.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function main() {
  try {
    // 1. Create dist directory if it doesn't exist
    if (!fs.existsSync(path.join(rootDir, 'dist'))) {
      fs.mkdirSync(path.join(rootDir, 'dist'));
    }
    
    // Create shared directory in dist
    if (!fs.existsSync(path.join(rootDir, 'dist', 'shared'))) {
      fs.mkdirSync(path.join(rootDir, 'dist', 'shared'));
    }

    // 2. Build the server
    await build({
      entryPoints: [path.join(rootDir, 'index.ts')],
      outfile: path.join(rootDir, 'dist', 'index.js'),
      bundle: true,
      platform: 'node',
      format: 'esm',
      minify: true,
      target: 'node18',
      external: [
        // Exclude frontend dependencies
        'vite', 
        '@vitejs/plugin-react', 
        'react',
        'react-dom',
        '@replit/vite-plugin-runtime-error-modal',
        '@replit/vite-plugin-cartographer',
        '../vite.config',
        // Add other frontend-only dependencies here
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
      alias: {
        '@shared': path.join(rootDir, 'shared')
      }
    });

    // 3. Build shared schema separately
    await build({
      entryPoints: [path.join(rootDir, 'shared', 'schema.ts')],
      outfile: path.join(rootDir, 'dist', 'shared', 'schema.js'),
      bundle: true,
      platform: 'node',
      format: 'esm',
      external: ['mongoose', 'zod'], // These will be resolved at runtime
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });

    console.log('Production build completed successfully!');
    
    // 4. Create stub files
    const viteStubContent = `
// Stub implementation for Vite in production
export default { middlewares: () => {} };
export const createServer = () => ({ middlewares: () => {} });
export const createLogger = () => ({ info: () => {}, error: () => {} });
    `;
    
    const viteReactStubContent = `
// Stub for @vitejs/plugin-react
export default function() { return { name: 'react-stub' }; }
    `;
    
    const replitStubContent = `
// Stub for @replit/vite-plugin-runtime-error-modal
export default function() { return { name: 'runtime-error-modal-stub' }; }
export function cartographerPlugin() { return { name: 'cartographer-stub' }; }
    `;
    
    fs.writeFileSync(path.join(rootDir, 'dist', 'vite-stub.js'), viteStubContent);
    fs.writeFileSync(path.join(rootDir, 'dist', 'react-stub.js'), viteReactStubContent);
    fs.writeFileSync(path.join(rootDir, 'dist', 'replit-stub.js'), replitStubContent);
    
    // Copy the replit-stub.js file to the dist directory
    fs.copyFileSync(path.join(rootDir, 'replit-stub.js'), path.join(rootDir, 'dist', 'replit-stub.js'));
    
    console.log('Created stub files for production environment');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
EOF
fi

# Run the production build
echo "Running production build..."
npx tsx scripts/build-production.ts 