// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: [
      {
        find: 'singular-core',
        replacement: path.resolve(__dirname, '../../packages/core/src')
      }
    ]
  },
  optimizeDeps: {
    exclude: ['singular-core']
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
});
