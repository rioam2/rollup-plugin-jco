import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';

export default defineConfig({
  plugins: [...(react() as PluginOption[])],
  server: {
    port: 3000,
  },
  build: {
    outDir: './dist',
  },
});
