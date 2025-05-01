// Environment variables for the client application
// Ensures proper TypeScript declarations for environment variables

/**
 * API URL from environment variables or default to Render production URL
 */
export const API_URL = import.meta.env.VITE_API_URL as string || 'https://govetx-creator-dashboard.onrender.com';

/**
 * Application version
 */
export const APP_VERSION = '1.0.0';

/**
 * Check if we're in production mode
 */
export const IS_PRODUCTION = import.meta.env.PROD as boolean;

/**
 * Check if we're in development mode
 */
export const IS_DEVELOPMENT = import.meta.env.DEV as boolean;

/**
 * Get base URL for the application (for building absolute URLs)
 */
export const BASE_URL = import.meta.env.BASE_URL as string;

/**
 * Safe function to get environment variables with proper typing
 * @param key The environment variable key
 * @param defaultValue Optional default value if not found
 * @returns The environment variable value or default
 */
export function getEnv<T>(key: string, defaultValue?: T): T {
  const value = import.meta.env[key];
  return value !== undefined ? value as T : (defaultValue as T);
} 