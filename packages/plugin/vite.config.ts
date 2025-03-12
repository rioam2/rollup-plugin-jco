/// <reference types="vite" />

import { defineConfig } from 'vitest/config';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';

export default defineConfig({
  appType: 'custom',
  base: './',
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: 'rollup-plugin-jco',
      fileName: 'index',
    },
    rollupOptions: {
      input: 'src/index.ts',
      treeshake: 'smallest',
      output: {
        dir: 'dist',
        format: 'esm',
        name: 'rollup-plugin-jco',
      },
    },
  },
  plugins: [checker({ typescript: true }), dts({ rollupTypes: true })],
  test: {
    include: ['test/**/*.test.ts', '**/*.test.ts'],
    globals: true,
    typecheck: {
      enabled: true,
      checker: 'tsc',
      tsconfig: 'tsconfig.vitest.json',
    },
  },
});
