import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  root: 'public',
  envDir: '../',
  publicDir: './data',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        test: resolve(__dirname, 'public/test-firebase.html')
      }
    },
    assetsInclude: ['**/*.csv'],
    copyPublicDir: true
  },
  assetsInclude: ['**/*.csv'],
  server: {
    port: 3000,
    open: true
  }
});