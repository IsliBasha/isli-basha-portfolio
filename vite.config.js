import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
  },
  preview: {
    allowedHosts: ['habitant-chowder-tiger.ngrok-free.dev'],
  },
  server: {
    allowedHosts: ['habitant-chowder-tiger.ngrok-free.dev'],
  },
});
