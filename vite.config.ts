import { screenGraphPlugin } from "@animaapp/vite-plugin-screen-graph";
import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), mode === "development" && screenGraphPlugin()],
  envPrefix: 'VITE_',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: 'localhost', // Accès local uniquement (évite les erreurs réseau)
    port: 5175, // Port utilisé par votre app
    // Configuration pour éviter les erreurs 404 au rafraîchissement
    historyApiFallback: true,
    proxy: {
      // Proxy pour l'API principale (back-genie7)
      '/api': {
        target: 'https://back-genie7-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔥 Proxy error (Genie API):', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📡 [Genie API] Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📨 [Genie API] Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      // Proxy pour l'API Concierge (nouvelle API hôtel)
      '/concierge-api': {
        target: 'https://concierge-production-859a.up.railway.app/api',
        changeOrigin: true,
        secure: true,
        timeout: 30000,
        rewrite: (path) => path.replace(/^\/concierge-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔥 Proxy error (Concierge API):', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📡 [Concierge API] Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📨 [Concierge API] Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  publicDir: "static",
  base: "/",
  css: {
    postcss: {
      plugins: [tailwind()],
    },
  },
}));
