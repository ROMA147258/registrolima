import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3180,
    host: '0.0.0.0', // Permite que se acceda desde el celular en la misma red local
  },
  build: {
    outDir: 'dist',
  }
});
