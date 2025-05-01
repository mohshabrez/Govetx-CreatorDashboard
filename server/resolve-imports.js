// This file helps resolve imports in production, especially for @shared paths

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Handle @shared imports
const resolveSharedImport = (importPath) => {
  if (importPath.startsWith('@shared/')) {
    const relativePath = importPath.replace('@shared/', './shared/');
    return path.resolve(__dirname, relativePath);
  }
  return importPath;
};

// Patch Node's module system to handle our custom imports
export function patchImports() {
  const Module = require('module');
  const originalResolveFilename = Module._resolveFilename;
  
  if (!Module._resolveFilename.patched) {
    Module._resolveFilename = function(request, parent, isMain, options) {
      const resolvedRequest = resolveSharedImport(request);
      return originalResolveFilename.call(this, resolvedRequest, parent, isMain, options);
    };
    Module._resolveFilename.patched = true;
  }
}

// Export utility for importing @shared modules
export function importShared(modulePath) {
  const resolvedPath = resolveSharedImport(`@shared/${modulePath}`);
  return import(resolvedPath);
} 