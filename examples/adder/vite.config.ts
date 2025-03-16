import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import { transpileComponent } from 'rollup-plugin-jco';

export default defineConfig({
  plugins: [
    ...(react() as PluginOption[]),
    transpileComponent({
      name: 'adder_component',
      inputFile: './bin/adder_component.wasm',
      outDir: './bindings',
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: './dist',
  },
});
