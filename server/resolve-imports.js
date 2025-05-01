// This file helps resolve imports in production, especially for @shared paths

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Handle special imports
const resolveSpecialImport = (importPath) => {
  // Handle @shared imports
  if (importPath.startsWith('@shared/')) {
    const relativePath = importPath.replace('@shared/', './shared/');
    return path.resolve(__dirname, relativePath);
  }
  
  // Handle Replit imports
  if (importPath === '@replit/vite-plugin-runtime-error-modal') {
    return path.resolve(__dirname, './replit-stub.js');
  }
  
  if (importPath === '@replit/vite-plugin-cartographer') {
    return path.resolve(__dirname, './replit-stub.js');
  }
  
  return importPath;
};

// Patch Node's module system to handle our custom imports
export function patchImports() {
  const Module = require('module');
  const originalResolveFilename = Module._resolveFilename;
  
  if (!Module._resolveFilename.patched) {
    Module._resolveFilename = function(request, parent, isMain, options) {
      const resolvedRequest = resolveSpecialImport(request);
      return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
    };
    Module._resolveFilename.patched = true;
  }
}

// Export utility for importing @shared modules
export function importShared(modulePath) {
  const resolvedPath = resolveSpecialImport(`@shared/${modulePath}`);
  return import(resolvedPath);
} 