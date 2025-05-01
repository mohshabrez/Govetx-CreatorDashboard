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
        '../vite.config',
        // Add other frontend-only dependencies here
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
      },
    });

    console.log('Production build completed successfully!');
    
    // 3. Create stub files
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
    
    fs.writeFileSync(path.join(rootDir, 'dist', 'vite-stub.js'), viteStubContent);
    fs.writeFileSync(path.join(rootDir, 'dist', 'react-stub.js'), viteReactStubContent);
    
    console.log('Created stub files for production environment');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main(); 