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