import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 3180,
    strictPort: false,
    host: '0.0.0.0', // Permite acceso desde celulares en la misma red local Wi-Fi
    allowedHosts: true, // Permite cualquier dominio de Cloudflare Tunnel
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200
  }
});
