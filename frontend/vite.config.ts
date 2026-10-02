import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

function rwandaLocationsSyncPlugin() {
  return {
    name: 'rwanda-locations-sync-plugin',
    configureServer() {
      const publicDataDir = path.resolve(__dirname, 'public', 'data');
      const targetPath = path.join(publicDataDir, 'rwandaLocations.json');
      try {
        if (!fs.existsSync(publicDataDir)) {
          fs.mkdirSync(publicDataDir, { recursive: true });
        }
        if (!fs.existsSync(targetPath) || fs.statSync(targetPath).size < 100000) {
          https.get('https://raw.githubusercontent.com/ngabovictor/Rwanda/master/data.json', (res) => {
            if (res.statusCode === 200) {
              const fileStream = fs.createWriteStream(targetPath);
              res.pipe(fileStream);
              fileStream.on('finish', () => {
                fileStream.close();
                console.log('[rwanda-locations] Complete Rwanda locations dataset (all cells & villages) synced to public/data/rwandaLocations.json');
              });
            }
          }).on('error', (err) => {
            console.warn('[rwanda-locations] Could not sync remote dataset:', err.message);
          });
        }
      } catch (e) {
        console.warn('[rwanda-locations] Error checking local dataset:', e);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), rwandaLocationsSyncPlugin()],
  build: {
    // Enable minification
    minify: 'esbuild',
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('lucide') || id.includes('framer-motion')) {
              return 'vendor-ui';
            }
            return 'vendor-utils';
          }
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps in development only
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8000',
        ws: true,
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
