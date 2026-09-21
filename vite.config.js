import { defineConfig } from "vite";

const headers = {
  "Permissions-Policy": "microphone=*, geolocation=*, fullscreen=*, autoplay=*, clipboard-read=*, clipboard-write=*",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: false,
    headers,
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    headers,
  },
  build: {
    target: ["es2020", "safari14", "firefox78", "edge88", "chrome80"],
  },
});
