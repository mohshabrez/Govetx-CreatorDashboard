// This file provides fallback implementations for imports that should
// only be available in development mode
import path from 'path';
import fs from 'fs';

// Map to track already loaded models to prevent duplicate registration
const loadedModels = new Map();

export function createViteImportResolver() {
  // In production, replace imports with stubs
  if (process.env.NODE_ENV === 'production') {
    // For @vitejs/plugin-react
    import.meta.resolve = async (specifier) => {
      if (specifier === '@vitejs/plugin-react') {
        return import.meta.url.replace('import-resolver.js', 'vitejs-stub.js');
      }
      if (specifier === 'vite') {
        return import.meta.url.replace('import-resolver.js', 'vite-stub.js');
      }
      return specifier; // Fall back to normal resolution for other imports
    };
  }
}

// Helper function to prevent duplicate model registration
export function registerMongooseModel(mongoose, modelName, schema) {
  if (loadedModels.has(modelName)) {
    return loadedModels.get(modelName);
  }
  
  const model = mongoose.models[modelName] || mongoose.model(modelName, schema);
  loadedModels.set(modelName, model);
  return model;
}

// Export stub implementations for common Vite-related functions
export const reactPlugin = {
  name: 'react-stub',
  transform: () => null
};

export const vitePlugin = {
  name: 'vite-stub',
  transform: () => null
}; 