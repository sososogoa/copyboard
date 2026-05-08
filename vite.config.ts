import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [crx({ manifest })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 },
  },
});
