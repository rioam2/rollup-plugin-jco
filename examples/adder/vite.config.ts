import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { transpileComponent, wasi } from 'rollup-plugin-jco';

export default defineConfig({
  plugins: [
    ...react(),
    transpileComponent({
      name: 'adder_component',
      inputFile: './bin/adder_component.wasm',
      outDir: './bindings',
      transpileOpts: {
        minify: true,
        tlaCompat: true,
        base64Cutoff: 9e9,
      },
    }),
    wasi({
      minify: true,
      tlaCompat: true,
      base64Cutoff: 9e9,
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: './dist',
  },
  test: {
    include: ['test/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    typecheck: {
      enabled: true,
      checker: 'tsc',
      tsconfig: 'tsconfig.vitest.json',
    },
  },
});
