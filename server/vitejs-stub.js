// Stub implementation for @vitejs/plugin-react
export default function reactPlugin() {
  return {
    name: 'react-stub',
    // Other plugin methods
    transform() { return null; }
  };
}

// Export individual functions that might be imported
export const reactPlugin = () => ({
  name: 'react-stub',
  transform() { return null; }
}); 