import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Allow the sandbox preview proxy host(s) to reach the dev server.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
  },
});
