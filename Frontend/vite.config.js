import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["qrcode.react"],
  },
  build: {
    outDir: 'dist', // This is the default. Ensure it's not changed to something else.
    chunkSizeWarningLimit: 1000, // Increase the limit as needed (default is 500 KB)
  },
  resolve: {
    alias: {
      '@tailwindConfig': path.resolve(__dirname, './tailwind.config.js'),
    },
  },
});
